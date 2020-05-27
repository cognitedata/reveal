/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import { Subject, Observable, combineLatest, animationFrameScheduler, from } from 'rxjs';
import { CadNode } from './CadNode';
import {
  scan,
  share,
  startWith,
  auditTime,
  filter,
  map,
  publish,
  switchAll,
  observeOn,
  flatMap,
  toArray
} from 'rxjs/operators';
import { SectorCuller } from './sector/culling/SectorCuller';
import { CachedRepository } from './sector/CachedRepository';
import { DetermineSectorsInput } from './sector/culling/types';
import { CadLoadingHints } from './CadLoadingHints';
import { ConsumedSector, WantedSector } from './sector/types';
import { distinctUntilLevelOfDetailChanged, filterCurrentWantedSectors } from './sector/sectorUtilities';

export class CadModelUpdateHandler {
  private readonly _cameraSubject: Subject<THREE.PerspectiveCamera> = new Subject();
  private readonly _clippingPlaneSubject: Subject<THREE.Plane[]> = new Subject();
  private readonly _loadingHintsSubject: Subject<CadLoadingHints> = new Subject();
  private readonly _modelSubject: Subject<CadNode> = new Subject();

  private readonly _updateObservable: Observable<ConsumedSector>;

  constructor(sectorRepository: CachedRepository, sectorCuller: SectorCuller) {
    const modelsArray: CadNode[] = [];
    this._updateObservable = combineLatest(
      this._cameraSubject.pipe(),
      this._clippingPlaneSubject.pipe(startWith([])),
      this._loadingHintsSubject.pipe(startWith({} as CadLoadingHints)),
      this._modelSubject.pipe(
        scan((array, next) => {
          array.push(next);
          return array;
        }, modelsArray)
      )
    ).pipe(
      auditTime(100),
      filter(
        ([_camera, _clippingPlanes, loadingHints, cadNodes]) =>
          cadNodes.length > 0 && loadingHints.suspendLoading !== true
      ),
      flatMap(([camera, clippingPlanes, loadingHints, cadNodes]) => {
        return from(cadNodes).pipe(
          filter(cadNode => cadNode.loadingHints.suspendLoading !== true),
          map(cadNode => cadNode.cadModelMetadata),
          toArray(),
          map(cadModels => {
            const input: DetermineSectorsInput = {
              camera,
              clippingPlanes,
              loadingHints,
              cadModelsMetadata: cadModels
            };
            return sectorCuller.determineSectors(input);
          })
        );
      }),
      // Load sectors from repository
      publish((wantedSectors: Observable<WantedSector[]>) =>
        wantedSectors.pipe(
          switchAll(),
          distinctUntilLevelOfDetailChanged(),
          sectorRepository.loadSector(),
          filterCurrentWantedSectors(wantedSectors)
        )
      ),
      observeOn(animationFrameScheduler)
    );
  }

  updateCamera(camera: THREE.PerspectiveCamera) {
    this._cameraSubject.next(camera);
  }

  updateClipPlanes(clipPlanes: THREE.Plane[]) {
    this._clippingPlaneSubject.next(clipPlanes);
  }

  updateModels(cadModel: CadNode) {
    this._modelSubject.next(cadModel);
  }

  updateLoadingHints(cadLoadingHints: CadLoadingHints) {
    this._loadingHintsSubject.next(cadLoadingHints);
  }

  observable() {
    return this._updateObservable.pipe(share());
  }
}
