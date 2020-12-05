/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import { from, Observable, Subject, zip } from 'rxjs';
import { concatMap, debounceTime, filter, map, reduce, share, takeWhile } from 'rxjs/operators';

import { ParseCtmResult, ParseSectorResult, SectorQuads } from '@cognite/reveal-parser-worker';

import { CadNode } from '..';
import { CadModelBudget } from '../../..';
import { SectorCuller } from '../../../internal';
import { assertNever, createOffsetsArray, LoadingState } from '../../../utilities';
import { BinaryFileProvider } from '../../../utilities/networking/types';
import { defaultCadModelSectorBudget } from '../CadModelSectorBudget';
import { MaterialManager } from '../MaterialManager';
import { InstancedMesh, InstancedMeshFile, TriangleMesh } from '../rendering/types';
import { CadSectorParser } from './CadSectorParser';
import { DetermineSectorsInput } from './culling/types';
import { LevelOfDetail } from './LevelOfDetail';
import { consumeSectorSimple, consumeSectorDetailed } from './sectorUtilities';
import { WantedSector, SectorGeometry, ConsumedSector } from './types';
import { MostFrequentlyUsedCache } from '../../../utilities/cache/MostFrequentlyUsedCache';

class OperationCanceledError extends Error {
  constructor() {
    super('Operation was canceled');
  }
}

interface CancellationSource {
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
  private readonly _consumedObservable = this._consumedSubject.pipe(share());
  private readonly _loadingStateUpdateTriggerSubject = new Subject<void>();
  private readonly _loadingStateObservable: Observable<LoadingState>;
  // TODO 2020-12-05 larsmoa: _parsedDataSubject is not triggered for incoming data!
  private readonly _parsedDataSubject = new Subject<{
    blobUrl: string;
    lod: string;
    data: SectorGeometry | SectorQuads;
  }>();
  private readonly _parsedDataObserable = this._parsedDataSubject.pipe(share());

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

    this._loadingStateObservable = this._loadingStateUpdateTriggerSubject.pipe(
      debounceTime(10),
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
      switch (sector.levelOfDetail) {
        case LevelOfDetail.Simple: {
          const group = await this._simpleSectorLoader.load(sector, cancellationSource);
          cancellationSource.throwIfCanceled();
          await this.updateScene(sector, LevelOfDetail.Simple, group);
          break;
        }

        case LevelOfDetail.Detailed: {
          const group = await this._detailedSectorLoader.load(sector, cancellationSource);
          cancellationSource.throwIfCanceled();
          await this.updateScene(sector, LevelOfDetail.Detailed, group);
          break;
        }

        case LevelOfDetail.Discarded:
          cancellationSource.throwIfCanceled();
          await this.updateScene(sector, LevelOfDetail.Discarded, undefined);
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

  private async updateScene(
    sector: WantedSector,
    lod: LevelOfDetail,
    geometry: THREE.Group | undefined
  ): Promise<void> {
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

class CadDetailedSectorLoader {
  private readonly _fileProvider: BinaryFileProvider;
  private readonly _parser: CadSectorParser;
  private readonly _materialManager: MaterialManager;
  private readonly _ctmCache = new MostFrequentlyUsedCache<string, Promise<ParseCtmResult>>(5);

  constructor(fileProvider: BinaryFileProvider, parser: CadSectorParser, materialManager: MaterialManager) {
    this._fileProvider = fileProvider;
    this._parser = parser;
    this._materialManager = materialManager;
  }

  async load(sector: WantedSector, cancellationSource: CancellationSource): Promise<THREE.Group> {
    const file = sector.metadata.indexFile;
    const materials = this._materialManager.getModelMaterials(sector.blobUrl);
    if (!materials) {
      throw new Error(`Could not find materials for model ${sector.blobUrl}`);
    }

    // Prefetch CTM
    const ctmFiles$ = from(file.peripheralFiles).pipe(filter(f => f.toLowerCase().endsWith('.ctm')));
    const ctms$ = ctmFiles$.pipe(
      takeWhile(() => !cancellationSource.isCanceled()),
      map(ctmFile => this.retrieveCTM(sector.blobUrl, ctmFile)),
      // Note! concatMap() is used to maintain ordering of files to make zip work below
      concatMap(p => p)
    );
    const ctmMap$ = zip(ctmFiles$, ctms$).pipe(
      map(v => ({ ctmFile: v[0], ctm: v[1] })),
      reduce((map, v) => {
        map.set(v.ctmFile, v.ctm);
        return map;
      }, new Map<string, ParseCtmResult>())
    );
    cancellationSource.throwIfCanceled();
    const ctmMap = await ctmMap$.toPromise();
    // TODO 2020-11-29 larsmoa: Implement caching of CTM

    // I3D
    cancellationSource.throwIfCanceled();
    const i3dBuffer = await downloadWithRetry(this._fileProvider, sector.blobUrl, file.fileName);
    cancellationSource.throwIfCanceled();
    const parsedI3D = await this._parser.parseI3D(new Uint8Array(i3dBuffer));

    // Stich together
    cancellationSource.throwIfCanceled();
    const geometry = await this.finalizeDetailed(parsedI3D, ctmMap);

    // Create ThreeJS group
    cancellationSource.throwIfCanceled();
    const group = consumeSectorDetailed(geometry, sector.metadata, materials);
    return group;
  }

  private retrieveCTM(baseUrl: string, filename: string): Promise<ParseCtmResult> {
    const key = createCtmKey(baseUrl, filename);
    const cachedCtm = this._ctmCache.get(key);
    if (cachedCtm !== undefined) {
      return cachedCtm;
    }
    // Not cached, retrieve
    const parser = this._parser;
    const fileProvider = this._fileProvider;
    async function retrieve(): Promise<ParseCtmResult> {
      const buffer = await downloadWithRetry(fileProvider, baseUrl, filename);
      const parsed = await parser.parseCTM(new Uint8Array(buffer));
      return parsed;
    }
    const promise = retrieve();
    this._ctmCache.set(key, promise);
    return promise;
  }

  private async finalizeDetailed(
    i3dFile: ParseSectorResult,
    ctmFiles: Map<string, ParseCtmResult>
  ): Promise<SectorGeometry> {
    const { instanceMeshes, triangleMeshes } = i3dFile;

    const finalTriangleMeshes = await (async () => {
      const { fileIds, colors, triangleCounts, treeIndices } = triangleMeshes;

      const meshesGroupedByFile = this.groupMeshesByNumber(fileIds);

      const finalMeshes = [];
      // Merge meshes by file
      // TODO do this in Rust instead
      for (const [fileId, meshIndices] of meshesGroupedByFile.entries()) {
        const fileTriangleCounts = meshIndices.map(i => triangleCounts[i]);
        const offsets = createOffsetsArray(fileTriangleCounts);
        // Load CTM (geometry)
        const fileName = `mesh_${fileId}.ctm`;
        const { indices, vertices, normals } = ctmFiles.get(fileName)!; // TODO: j-bjorne 16-04-2020: try catch error???

        const sharedColors = new Uint8Array(3 * indices.length);
        const sharedTreeIndices = new Float32Array(indices.length);

        for (let i = 0; i < meshIndices.length; i++) {
          const meshIdx = meshIndices[i];
          const treeIndex = treeIndices[meshIdx];
          const triOffset = offsets[i];
          const triCount = fileTriangleCounts[i];
          const [r, g, b] = [colors[4 * meshIdx + 0], colors[4 * meshIdx + 1], colors[4 * meshIdx + 2]];
          for (let triIdx = triOffset; triIdx < triOffset + triCount; triIdx++) {
            for (let j = 0; j < 3; j++) {
              const vIdx = indices[3 * triIdx + j];

              sharedTreeIndices[vIdx] = treeIndex;

              sharedColors[3 * vIdx] = r;
              sharedColors[3 * vIdx + 1] = g;
              sharedColors[3 * vIdx + 2] = b;
            }
          }
        }

        const mesh: TriangleMesh = {
          colors: sharedColors,
          fileId,
          treeIndices: sharedTreeIndices,
          indices,
          vertices,
          normals
        };
        finalMeshes.push(mesh);
        // Splits processing up in multiple chunks to avoid a long running task in the micro queue
        await yieldProcessing();
      }
      return finalMeshes;
    })();

    const finalInstanceMeshes = await (async () => {
      const { fileIds, colors, treeIndices, triangleCounts, triangleOffsets, instanceMatrices } = instanceMeshes;
      const meshesGroupedByFile = this.groupMeshesByNumber(fileIds);

      const finalMeshes: InstancedMeshFile[] = [];
      // Merge meshes by file
      // TODO do this in Rust instead
      // TODO de-duplicate this with the merged meshes above
      for (const [fileId, meshIndices] of meshesGroupedByFile.entries()) {
        const fileName = `mesh_${fileId}.ctm`;
        const ctm = ctmFiles.get(fileName)!;

        const indices = ctm.indices;
        const vertices = ctm.vertices;
        const normals = ctm.normals;
        const instancedMeshes: InstancedMesh[] = [];

        const fileTriangleOffsets = new Float64Array(meshIndices.map(i => triangleOffsets[i]));
        const fileTriangleCounts = new Float64Array(meshIndices.map(i => triangleCounts[i]));
        const fileMeshesGroupedByOffsets = this.groupMeshesByNumber(fileTriangleOffsets);

        for (const [triangleOffset, fileMeshIndices] of fileMeshesGroupedByOffsets) {
          // NOTE the triangle counts should be the same for all meshes with the same offset,
          // hence we can look up only fileMeshIndices[0] instead of enumerating here
          const triangleCount = fileTriangleCounts[fileMeshIndices[0]];
          const instanceMatrixBuffer = new Float32Array(16 * fileMeshIndices.length);
          const treeIndicesBuffer = new Float32Array(fileMeshIndices.length);
          const colorBuffer = new Uint8Array(4 * fileMeshIndices.length);
          for (let i = 0; i < fileMeshIndices.length; i++) {
            const meshIdx = meshIndices[fileMeshIndices[i]];
            const treeIndex = treeIndices[meshIdx];
            const instanceMatrix = instanceMatrices.slice(meshIdx * 16, meshIdx * 16 + 16);
            instanceMatrixBuffer.set(instanceMatrix, i * 16);
            treeIndicesBuffer[i] = treeIndex;
            const color = colors.slice(meshIdx * 4, meshIdx * 4 + 4);
            colorBuffer.set(color, i * 4);
          }
          instancedMeshes.push({
            triangleCount,
            triangleOffset,
            instanceMatrices: instanceMatrixBuffer,
            colors: colorBuffer,
            treeIndices: treeIndicesBuffer
          });
        }

        const mesh: InstancedMeshFile = {
          fileId,
          indices,
          vertices,
          normals,
          instances: instancedMeshes
        };
        finalMeshes.push(mesh);
        // Splits processing up in multiple chunks to avoid a long running task in the micro queue
        await yieldProcessing();
      }

      return finalMeshes;
    })();

    const sector: SectorGeometry = {
      treeIndexToNodeIdMap: i3dFile.treeIndexToNodeIdMap,
      nodeIdToTreeIndexMap: i3dFile.nodeIdToTreeIndexMap,
      primitives: i3dFile.primitives,
      instanceMeshes: finalInstanceMeshes,
      triangleMeshes: finalTriangleMeshes
    };

    return sector;
  }

  private groupMeshesByNumber(fileIds: Float64Array) {
    const meshesGroupedByFile = new Map<number, number[]>();
    for (let i = 0; i < fileIds.length; ++i) {
      const fileId = fileIds[i];
      const oldValue = meshesGroupedByFile.get(fileId);
      if (oldValue) {
        meshesGroupedByFile.set(fileId, [...oldValue, i]);
      } else {
        meshesGroupedByFile.set(fileId, [i]);
      }
    }
    return meshesGroupedByFile;
  }
}

class CadSimpleSectorLoader {
  private readonly _fileProvider: BinaryFileProvider;
  private readonly _parser: CadSectorParser;
  private readonly _materialManager: MaterialManager;

  constructor(fileProvider: BinaryFileProvider, parser: CadSectorParser, materialManager: MaterialManager) {
    this._fileProvider = fileProvider;
    this._parser = parser;
    this._materialManager = materialManager;
  }

  public async load(sector: WantedSector, cancellationSource: CancellationSource): Promise<THREE.Group> {
    const file = sector.metadata.facesFile;
    if (!file.fileName) {
      throw new Error(`Sector '${sector.metadata.path} does not have simple geometry`);
    }
    const materials = this._materialManager.getModelMaterials(sector.blobUrl);
    if (!materials) {
      throw new Error(`Could not find materials for model ${sector.blobUrl}`);
    }

    const buffer = await downloadWithRetry(this._fileProvider, sector.blobUrl, file.fileName!);
    cancellationSource.throwIfCanceled();
    const parsed = await this._parser.parseF3D(new Uint8Array(buffer));
    cancellationSource.throwIfCanceled();
    const geometryGroup = consumeSectorSimple(parsed, materials);
    return geometryGroup;
  }
}

async function downloadWithRetry(
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

async function yieldProcessing(): Promise<void> {
  await new Promise<void>(resolve => setImmediate(resolve));
}

function createSectorKey(sector: WantedSector): string {
  return `${sector.blobUrl}/${sector.metadata.id}:${sector.levelOfDetail}`;
}

function createCtmKey(baseUrl: string, filename: string) {
  return `${baseUrl}/${filename}`;
}
