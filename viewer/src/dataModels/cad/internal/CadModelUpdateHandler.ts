/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import { Subject, Observable, combineLatest, animationFrameScheduler } from 'rxjs';
import { CadNode } from './CadNode';
import { ConsumedSector } from './sector/ConsumedSector';
import { scan, share, startWith, auditTime, filter, map, publish, switchAll, observeOn } from 'rxjs/operators';
import { CadModelMetadata } from '.';
import { SectorCuller } from './sector/culling/SectorCuller';
import { distinctUntilLevelOfDetailChanged } from './sector/distinctUntilLevelOfDetailChanged';
import { filterCurrentWantedSectors } from './sector/filterCurrentWantedSectors';
import { WantedSector } from './sector/WantedSector';
import { CachedRepository } from './sector/CachedRepository';
import { fromThreeCameraConfig } from '@/utilities/fromThreeCameraConfig';
import { CadLoadingHints } from '@/dataModels/cad/public/CadLoadingHints';

export class CadModelUpdateHandler {
  private readonly _cameraSubject: Subject<THREE.PerspectiveCamera> = new Subject();
  private readonly _loadingHintsSubject: Subject<CadLoadingHints> = new Subject();
  private readonly _modelSubject: Subject<CadNode> = new Subject();

  private readonly _updateObservable: Observable<ConsumedSector>;

  constructor(sectorRepository: CachedRepository, sectorCuller: SectorCuller) {
    const modelsArray: CadModelMetadata[] = [];
    const modelsObservable: Observable<CadModelMetadata[]> = this._modelSubject.pipe(
      map(cadNode => cadNode.cadModelMetadata),
      scan((array, next) => {
        array.push(next);
        return array;
      }, modelsArray)
    );
    this._updateObservable = combineLatest(
      this._cameraSubject.pipe(fromThreeCameraConfig()),
      this._loadingHintsSubject.pipe(startWith({} as CadLoadingHints)),
      modelsObservable
    ).pipe(
      auditTime(100),
      filter(
        ([_cameraConfig, loadingHints, cadModels]) => cadModels.length > 0 && loadingHints.suspendLoading !== true
      ),
      map(([cameraConfig, loadingHints, cadModels]) =>
        sectorCuller.determineSectors({ cameraConfig, cadModels, loadingHints })
      ),
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
