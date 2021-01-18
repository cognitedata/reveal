/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { asyncScheduler, Observable, Subject } from 'rxjs';
import { debounceTime, filter, map, observeOn, share, subscribeOn } from 'rxjs/operators';

import { CadNode } from '..';
import { CadModelBudget } from '../../..';
import { SectorCuller } from '../../../internal';
import { assertNever, LoadingState } from '../../../utilities';
import { BinaryFileProvider } from '../../../utilities/networking/types';
import { defaultCadModelSectorBudget } from '../CadModelSectorBudget';
import { MaterialManager } from '../MaterialManager';
import { SectorGeometry, SectorQuads } from '../rendering/types';
import { CadSectorParser } from './CadSectorParser';
import { DetermineSectorsInput } from './culling/types';
import { LevelOfDetail } from './LevelOfDetail';
import { WantedSector, ConsumedSector } from './types';
import { CadDetailedSectorLoader } from './CadDetailedSectorLoader';
import { CadSimpleSectorLoader } from './CadSimpleSectorLoader';

class OperationCanceledError extends Error {
  constructor() {
    super('Operation was canceled');
  }
}

export interface CancellationSource {
  throwIfCanceled(): void;
  isCanceled(): boolean;
}

export class CadSectorLoader {
  /**
   * How long a camera must be stationary before it's considered "at rest".
   */
  private static readonly CameraInRestThreshold = 250;
  /**
   * How often we allow updating the sectors to load.
   */
  private static readonly UpdateAuditTime = 250;

  private readonly _sectorCuller: SectorCuller;
  private readonly _fileProvider: BinaryFileProvider;
  private readonly _modelDataParser: CadSectorParser;
  private readonly _materialManager: MaterialManager;

  private readonly _simpleSectorLoader: CadSimpleSectorLoader;
  private readonly _detailedSectorLoader: CadDetailedSectorLoader;

  private readonly _consumedSubject = new Subject<ConsumedSector>();
  private readonly _consumedObservable: Observable<ConsumedSector>;
  private readonly _loadingStateUpdateTriggerSubject = new Subject<void>();
  private readonly _loadingStateObservable: Observable<LoadingState>;
  // TODO 2020-12-05 larsmoa: _parsedDataSubject is not triggered for incoming data!
  private readonly _parsedDataSubject = new Subject<{
    blobUrl: string;
    lod: string;
    data: SectorGeometry | SectorQuads;
  }>();
  private readonly _parsedDataObserable = this._parsedDataSubject.pipe(observeOn(asyncScheduler), share());

  private _budget: CadModelBudget = defaultCadModelSectorBudget;
  private _camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera();
  private _clippingPlanes: THREE.Plane[] = [];
  private _clipIntersection: boolean = false;
  private _models: CadNode[] = [];

  private _lastLoadTriggerTimestamp = 0;
  private _lastCameraTimestamp = 0;
  private _pendingLoadOperationId: number | undefined = undefined;

  // Total number of operations in this batch to keep track of progress
  private _operationCountInBatch = 0;
  // Identifiers of currently pending ongoing load operations
  private _pendingOperations = new Map<string, WantedSector>();

  constructor(
    sectorCuller: SectorCuller,
    fileProvider: BinaryFileProvider,
    modelDataParser: CadSectorParser,
    materialManager: MaterialManager
  ) {
    this._sectorCuller = sectorCuller;
    this._fileProvider = fileProvider;
    this._modelDataParser = modelDataParser;
    this._materialManager = materialManager;

    this._simpleSectorLoader = new CadSimpleSectorLoader(
      this._fileProvider,
      this._modelDataParser,
      this._materialManager
    );
    this._detailedSectorLoader = new CadDetailedSectorLoader(
      this._fileProvider,
      this._modelDataParser,
      this._materialManager
    );

    this._consumedObservable = this._consumedSubject.pipe(
      observeOn(asyncScheduler),
      share(),
      // Avoid reporting sectors from removed models (pending requests might still come in for a while)
      filter(x => this._models.some(model => model.cadModelMetadata.blobUrl === x.blobUrl))
    );

    this._loadingStateObservable = this._loadingStateUpdateTriggerSubject.pipe(
      subscribeOn(asyncScheduler),
      debounceTime(100),
      map(() => {
        const pendingCount = this.countPendingOperations();
        const state: LoadingState = {
          isLoading: pendingCount > 0,
          itemsLoaded: this._operationCountInBatch - pendingCount,
          itemsRequested: this._operationCountInBatch
        };
        return state;
      }),
      share()
    );
  }

  dispose() {
    this._consumedSubject.complete();
    this._loadingStateUpdateTriggerSubject.complete();
    this._parsedDataSubject.complete();
    this._sectorCuller.dispose();
  }

  consumedSectorObservable(): Observable<ConsumedSector> {
    return this._consumedObservable;
  }

  loadingStateObservable(): Observable<LoadingState> {
    return this._loadingStateObservable;
  }

  parsedDataObservable(): Observable<{ blobUrl: string; lod: string; data: SectorGeometry | SectorQuads }> {
    return this._parsedDataObserable;
  }

  addModel(model: CadNode): void {
    this._models.push(model);
    this.triggerUpdate();
  }

  removeModel(model: CadNode): void {
    const index = this._models.findIndex(m => m === model);
    if (index === -1) {
      throw new Error('Cannot remove model - not added');
    }
    this._models.splice(index, 1);
    this.triggerUpdate();
  }

  updateBudget(budget: CadModelBudget): void {
    this._budget = budget;
    this.triggerUpdate();
  }

  updateCamera(camera: THREE.PerspectiveCamera): void {
    this._camera = camera;
    this._lastCameraTimestamp = Date.now();
    this.triggerUpdate();
  }

  updateClippingPlanes(planes: THREE.Plane[]): void {
    this._clippingPlanes = planes;
    this.triggerUpdate();
  }

  updateClipIntersection(clipIntersection: boolean): void {
    this._clipIntersection = clipIntersection;
    this.triggerUpdate();
  }

  private triggerUpdate() {
    if (this._pendingLoadOperationId) {
      // No need to trigger a new update - already scheduled
      return;
    }

    const timeSinceUpdate = Date.now() - this._lastLoadTriggerTimestamp;
    const timeToNextUpdate = Math.max(0, CadSectorLoader.UpdateAuditTime - timeSinceUpdate);
    const updateCb = this.update.bind(this);
    this._pendingLoadOperationId = window.setTimeout(async () => {
      await this.cameraAtRestBarrier();
      await updateCb();
    }, timeToNextUpdate);
  }

  private async update(): Promise<void> {
    this._pendingLoadOperationId = undefined;

    const input = this.createDetermineSectorsInput();
    const wantedSectors = this._sectorCuller.determineSectors(input);
    await this.consumeSectors(wantedSectors);
  }

  private createDetermineSectorsInput(): DetermineSectorsInput {
    const input: DetermineSectorsInput = {
      camera: this._camera,
      clippingPlanes: this._clippingPlanes,
      clipIntersection: this._clipIntersection,
      cadModelsMetadata: this._models
        .filter(x => !x.loadingHints || !x.loadingHints.suspendLoading)
        .map(x => x.cadModelMetadata),
      budget: this._budget
    };
    return input;
  }

  private async consumeSector(sector: WantedSector): Promise<void> {
    const operationId = createSectorKey(sector);

    // Create a cancellation source that will cancel operations when they
    // are no longer in the "pending operations" set.
    const cancellationSource: CancellationSource = {
      isCanceled: () => {
        return !this._pendingOperations.has(operationId);
      },
      throwIfCanceled: () => {
        if (cancellationSource.isCanceled()) {
          throw new OperationCanceledError();
        }
      }
    };

    // Schedule an operation to perform the update (i.e. load or discard)
    try {
      cancellationSource.throwIfCanceled();
      switch (sector.levelOfDetail) {
        case LevelOfDetail.Simple: {
          const group = await this._simpleSectorLoader.load(sector, cancellationSource);
          cancellationSource.throwIfCanceled();
          this.updateScene(sector, LevelOfDetail.Simple, group);
          break;
        }

        case LevelOfDetail.Detailed: {
          const group = await this._detailedSectorLoader.load(sector, cancellationSource);
          cancellationSource.throwIfCanceled();
          this.updateScene(sector, LevelOfDetail.Detailed, group);
          break;
        }

        case LevelOfDetail.Discarded:
          cancellationSource.throwIfCanceled();
          this.updateScene(sector, LevelOfDetail.Discarded, undefined);
          break;

        default:
          assertNever(sector.levelOfDetail);
      }
    } catch (error) {
      // Ignore if operations was canceled
      if (!(error instanceof OperationCanceledError)) {
        throw error;
      }
    } finally {
      this.markOperationDone(operationId);
    }
  }

  private markOperationDone(operationId: string): void {
    if (this._pendingOperations.delete(operationId)) {
      this.reportLoadingState();
    }
  }

  private reportLoadingState() {
    this._loadingStateUpdateTriggerSubject.next();
  }

  private countPendingOperations(): number {
    let count = 0;
    this._pendingOperations.forEach(x => {
      if (x.levelOfDetail !== LevelOfDetail.Discarded) {
        count++;
      }
    });
    return count;
  }

  private updateOperations(sectors: WantedSector[]): WantedSector[] {
    const validOperations = new Map<string, WantedSector>(sectors.map(x => [createSectorKey(x), x]));

    // Determine sectors we will need to start loading before we update list of operations
    const changedSectors = sectors.filter(x => !this._pendingOperations.has(createSectorKey(x)));

    // Update operations
    this._pendingOperations = validOperations;
    this._operationCountInBatch = this.countPendingOperations();

    return changedSectors;
  }

  private async consumeSectors(sectors: WantedSector[]): Promise<void> {
    const changedSectors = this.updateOperations(sectors);
    this.reportLoadingState();

    const operations = changedSectors.map(sector => this.consumeSector(sector));
    await Promise.all(operations);

    this.reportLoadingState();
  }

  private updateScene(sector: WantedSector, lod: LevelOfDetail, geometry: THREE.Group | undefined): void {
    const consumedSector: ConsumedSector = {
      blobUrl: sector.blobUrl,
      metadata: sector.metadata,
      levelOfDetail: lod,
      group: geometry
    };
    this._consumedSubject.next(consumedSector);
  }

  private get isCameraAtRest(): boolean {
    return Date.now() - this._lastCameraTimestamp > CadSectorLoader.CameraInRestThreshold;
  }

  /**
   * Creates a promise that resolves immediatly when the camera is at rest.
   */
  private cameraAtRestBarrier(): Promise<void> {
    if (this.isCameraAtRest) {
      return Promise.resolve();
    }
    return new Promise<void>(resolve => {
      const handle = setInterval(() => {
        if (this.isCameraAtRest) {
          resolve();
          clearInterval(handle);
        }
      }, 50);
    });
  }
}

export async function downloadWithRetry(
  fileProvider: BinaryFileProvider,
  baseUrl: string,
  filename: string,
  attempts: number = 3
): Promise<ArrayBuffer> {
  for (let i = 1; i <= attempts; i++) {
    try {
      return await fileProvider.getBinaryFile(baseUrl, filename);
    } catch (e) {
      if (i === attempts) {
        throw e;
      }
    }
  }
  // Should never occur as it's guranteed that the above will either return or throw
  throw new Error('downloadWithRetry is broken - fix code');
}

function createSectorKey(sector: WantedSector): string {
  return `${sector.blobUrl}/${sector.metadata.id}:${sector.levelOfDetail}`;
}

export function createCtmKey(baseUrl: string, filename: string) {
  return `${baseUrl}/${filename}`;
}
