/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { assertNever } from '@reveal/utilities';
import { ConsumedSector } from '@reveal/cad-parsers';

import { Subject, Observable, combineLatest, asyncScheduler, BehaviorSubject } from 'rxjs';
import { scan, share, startWith, auditTime, filter, map, observeOn, mergeMap } from 'rxjs/operators';
import { SectorCuller } from './sector/culling/SectorCuller';
import { CadLoadingHints } from './CadLoadingHints';

import { LoadingState } from '@reveal/model-base';
import { emissionLastMillis } from './utilities/rxOperations';
import { loadingEnabled } from './sector/rxSectorUtilities';
import { SectorLoader } from './sector/SectorLoader';
import { CadModelBudget, defaultCadModelBudget } from './CadModelBudget';
import { DetermineSectorsPayload, SectorLoadingSpent } from './sector/culling/types';
import { ModelStateHandler } from './sector/ModelStateHandler';
import { CadNode } from '@reveal/cad-model';

const notLoadingState: LoadingState = { isLoading: false, itemsLoaded: 0, itemsRequested: 0, itemsCulled: 0 };

export class CadModelUpdateHandler {
  private readonly _sectorCuller: SectorCuller;
  private readonly _modelStateHandler: ModelStateHandler;
  private _budget: CadModelBudget;
  private _lastSpent: SectorLoadingSpent;

  private readonly _cameraSubject: Subject<THREE.PerspectiveCamera> = new Subject();
  private readonly _clippingPlaneSubject: Subject<THREE.Plane[]> = new Subject();
  private readonly _loadingHintsSubject: Subject<CadLoadingHints> = new Subject();
  private readonly _prioritizedLoadingHintsSubject: Subject<void> = new Subject();
  private readonly _modelSubject: Subject<{ model: CadNode; operation: 'add' | 'remove' }> = new Subject();
  private readonly _budgetSubject: Subject<CadModelBudget> = new Subject();
  private readonly _progressSubject: Subject<LoadingState> = new BehaviorSubject<LoadingState>(notLoadingState);

  private _updateObservable: Observable<ConsumedSector> | undefined;

  constructor(sectorCuller: SectorCuller, continuousModelStreaming = false) {
    this._sectorCuller = sectorCuller;
    this._modelStateHandler = new ModelStateHandler();
    this._budget = defaultCadModelBudget;
    this._lastSpent = {
      downloadSize: 0,
      drawCalls: 0,
      renderCost: 0,
      loadedSectorCount: 0,
      simpleSectorCount: 0,
      detailedSectorCount: 0,
      forcedDetailedSectorCount: 0,
      totalSectorCount: 0,
      accumulatedPriority: 0
    };

    /* Creates and observable that emits an event when either of the observables emitts an item.
     * ------- new camera --------\
     * --- new clipping plane -----\
     * --- new priority load hint --\
     * --- new clip intersection ----\_______ DetermineSectorsInput
     * --- new global loading hints--/
     * --- new camera motion state -/
     * --- changes in cadmodels ---/
     * ------ sector budget ------/
     */
    const combinator = combineLatest([
      combineLatest([
        this._loadingHintsSubject.pipe(startWith({} as CadLoadingHints)),
        this._budgetSubject.pipe(startWith(this._budget))
      ]).pipe(map(makeSettingsInput)),
      this._prioritizedLoadingHintsSubject.pipe(startWith(undefined as void)),
      combineLatest([
        this._cameraSubject.pipe(auditTime(500)),
        this._cameraSubject.pipe(auditTime(250), emissionLastMillis(600))
      ]).pipe(map(makeCameraInput)),
      combineLatest([this._clippingPlaneSubject.pipe(startWith([]))]).pipe(map(makeClippingInput)),
      this.loadingModelObservable()
    ]);
    const collectStatisticsCallback = (spendage: SectorLoadingSpent) => {
      this._lastSpent = spendage;
    };
    const reportProgressCallback = (loaded: number, requested: number, culled: number) => {
      const state: LoadingState = {
        isLoading: requested > loaded,
        itemsRequested: requested,
        itemsLoaded: loaded,
        itemsCulled: culled
      };
      this._progressSubject.next(state);
    };
    const determineSectorsHandler = new SectorLoader(
      sectorCuller,
      this._modelStateHandler,
      collectStatisticsCallback,
      reportProgressCallback,
      continuousModelStreaming
    );

    async function* loadSectors(input: DetermineSectorsPayload) {
      for await (const sector of determineSectorsHandler.loadSectors(input)) {
        yield sector;
      }
    }

    this._updateObservable = combinator.pipe(
      observeOn(asyncScheduler), // Schedule tasks on macro task queue (setInterval)
      auditTime(250), // Take the last value every 250ms
      map(createDetermineSectorsInput), // Map from array to interface (enables destructuring)
      filter(loadingEnabled), // should we load?
      mergeMap(async x => loadSectors(x)),
      mergeMap(x => x)
    );
  }

  dispose(): void {
    delete this._updateObservable;
    this._modelSubject.unsubscribe();
    this._sectorCuller.dispose();
  }

  updateCamera(camera: THREE.PerspectiveCamera): void {
    this._cameraSubject.next(camera);
  }

  set clippingPlanes(value: THREE.Plane[]) {
    this._clippingPlaneSubject.next(value);
  }

  get budget(): CadModelBudget {
    return this._budget;
  }
  set budget(b: CadModelBudget) {
    this._budget = b;
    this._budgetSubject.next(b);
  }

  get lastBudgetSpendage(): SectorLoadingSpent {
    return this._lastSpent;
  }

  addModel(model: CadNode): void {
    this._modelStateHandler.addModel(model.cadModelMetadata.modelIdentifier);
    this._modelSubject.next({ model, operation: 'add' });
    model.nodeAppearanceProvider.on('prioritizedAreasChanged', () => this.updatePrioritizedAreas());
  }

  removeModel(model: CadNode): void {
    this._modelStateHandler.removeModel(model.cadModelMetadata.modelIdentifier);
    this._modelSubject.next({ model, operation: 'remove' });
  }

  updateLoadingHints(cadLoadingHints: CadLoadingHints): void {
    this._loadingHintsSubject.next(cadLoadingHints);
  }

  private updatePrioritizedAreas(): void {
    this._prioritizedLoadingHintsSubject.next();
  }

  consumedSectorObservable(): Observable<ConsumedSector> {
    return this._updateObservable!.pipe(share());
  }

  getLoadingStateObserver(): Observable<LoadingState> {
    return this._progressSubject;
  }

  /**
   * When loading hints of a CAD model changes, propagate the event down to the stream and either add or remove
   * the {@link CadModelMetadata} from the array and push the new array down stream
   */
  private loadingModelObservable() {
    return this._modelSubject.pipe(
      scan((array, next) => {
        const { model, operation } = next;
        switch (operation) {
          case 'add':
            array.push(model);
            return array;
          case 'remove':
            return array.filter(x => x.cadModelMetadata.modelIdentifier !== model.cadModelMetadata.modelIdentifier);
          default:
            assertNever(operation);
        }
      }, [] as CadNode[])
    );
  }
}

type SettingsInput = {
  loadingHints: CadLoadingHints;
  budget: CadModelBudget;
};
type CameraInput = {
  camera: THREE.PerspectiveCamera;
  cameraInMotion: boolean;
};
type ClippingInput = {
  clippingPlanes: THREE.Plane[] | never[];
};

function makeSettingsInput([loadingHints, budget]: [CadLoadingHints, CadModelBudget]): SettingsInput {
  return { loadingHints, budget };
}
function makeCameraInput([camera, cameraInMotion]: [THREE.PerspectiveCamera, boolean]): CameraInput {
  return { camera, cameraInMotion };
}
function makeClippingInput([clippingPlanes]: [THREE.Plane[]]): ClippingInput {
  return { clippingPlanes };
}

function createDetermineSectorsInput([settings, _, camera, clipping, models]: [
  SettingsInput,
  void,
  CameraInput,
  ClippingInput,
  CadNode[]
]): DetermineSectorsPayload {
  const prioritizedAreas = models.flatMap(model => model.prioritizedAreas);
  return {
    ...camera,
    ...settings,
    ...clipping,
    prioritizedAreas,
    models
  };
}
