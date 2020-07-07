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
  observeOn,
  flatMap,
  toArray,
  tap
} from 'rxjs/operators';
import { SectorCuller } from './sector/culling/SectorCuller';
import { CachedRepository } from './sector/CachedRepository';
import { DetermineSectorsInput } from './sector/culling/types';
import { CadLoadingHints } from './CadLoadingHints';
import { ConsumedSector, WantedSector } from './sector/types';
import { distinctUntilLevelOfDetailChanged, filterCurrentWantedSectors } from './sector/sectorUtilities';
import { LevelOfDetail } from './sector/LevelOfDetail';
import { emissionLastMillis } from '@/utilities';

export class CadModelUpdateHandler {
  private readonly _cameraSubject: Subject<THREE.PerspectiveCamera> = new Subject();
  private readonly _clippingPlaneSubject: Subject<THREE.Plane[]> = new Subject();
  private readonly _clipIntersectionSubject: Subject<boolean> = new Subject();
  private readonly _loadingHintsSubject: Subject<CadLoadingHints> = new Subject();
  private readonly _modelSubject: Subject<CadNode> = new Subject();

  private readonly _updateObservable: Observable<ConsumedSector>;

  constructor(sectorRepository: CachedRepository, sectorCuller: SectorCuller) {
    const modelsArray: CadNode[] = [];
    this._updateObservable = combineLatest(
      this._cameraSubject.pipe(auditTime(1000)),
      this._clippingPlaneSubject.pipe(startWith([])),
      this._clipIntersectionSubject.pipe(startWith(false)),
      this._loadingHintsSubject.pipe(startWith({} as CadLoadingHints)),
      this._cameraSubject.pipe(auditTime(250), emissionLastMillis(600)),
      this._modelSubject.pipe(
        share(),
        scan((array, next) => {
          array.push(next);
          return array;
        }, modelsArray)
      )
    ).pipe(
      auditTime(250),
      filter(
        ([_camera, _clippingPlanes, _clipIntersection, loadingHints, _cameraInMotion, cadNodes]) =>
          cadNodes.length > 0 && loadingHints.suspendLoading !== true
      ),
      flatMap(([camera, clippingPlanes, clipIntersection, loadingHints, cameraInMotion, cadNodes]) => {
        return from(cadNodes).pipe(
          filter(cadNode => cadNode.loadingHints.suspendLoading !== true),
          map(cadNode => cadNode.cadModelMetadata),
          toArray(),
          map(cadModels => {
            const input: DetermineSectorsInput = {
              camera,
              cameraInMotion,
              clippingPlanes,
              clipIntersection,
              loadingHints,
              cadModelsMetadata: cadModels
            };
            return sectorCuller.determineSectors(input);
          })
        );
      }),
      // Load sectors from repository
      publish((wantedSectors: Observable<WantedSector[]>) => {
        const modelSectorStates: { [blobUrl: string]: { [id: number]: LevelOfDetail } } = {};
        const unloadedSectorsObservable = wantedSectors.pipe(
          flatMap(wantedSectorArray => {
            return from(wantedSectorArray).pipe(
              filter(wantedSector => {
                const sectorStates = modelSectorStates[wantedSector.blobUrl];
                if (sectorStates) {
                  const sectorState = sectorStates[wantedSector.metadata.id];
                  return sectorState !== wantedSector.levelOfDetail;
                }
                return true;
              }),
              toArray()
            );
          })
        );

        return unloadedSectorsObservable.pipe(
          sectorRepository.loadSector(),
          filterCurrentWantedSectors(wantedSectors),
          distinctUntilLevelOfDetailChanged(),
          tap(consumedSector => {
            let sectorStates = modelSectorStates[consumedSector.blobUrl];
            if (!sectorStates) {
              sectorStates = {};
              modelSectorStates[consumedSector.blobUrl] = sectorStates;
            }
            if (consumedSector.levelOfDetail === LevelOfDetail.Discarded) {
              delete sectorStates[consumedSector.metadata.id];
            } else {
              sectorStates[consumedSector.metadata.id] = consumedSector.levelOfDetail;
            }
          })
        );
      }),
      observeOn(animationFrameScheduler)
    );
  }

  updateCamera(camera: THREE.PerspectiveCamera) {
    this._cameraSubject.next(camera);
  }

  set clippingPlanes(value: THREE.Plane[]) {
    this._clippingPlaneSubject.next(value);
  }

  set clipIntersection(value: boolean) {
    this._clipIntersectionSubject.next(value);
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
