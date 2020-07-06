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
import { DetermineSectorsInput } from './sector/culling/types';
import { CadLoadingHints } from './CadLoadingHints';
import { ConsumedSector, WantedSector, SectorGeometry } from './sector/types';
import { distinctUntilLevelOfDetailChanged, filterCurrentWantedSectors } from './sector/sectorUtilities';
import { LevelOfDetail } from './sector/LevelOfDetail';
import { Repository } from './sector/Repository';
import { SectorQuads } from './rendering/types';

export class CadModelUpdateHandler {
  private readonly _sectorRepository: Repository;
  private readonly _cameraSubject: Subject<THREE.PerspectiveCamera> = new Subject();
  private readonly _clippingPlaneSubject: Subject<THREE.Plane[]> = new Subject();
  private readonly _clipIntersectionSubject: Subject<boolean> = new Subject();
  private readonly _loadingHintsSubject: Subject<CadLoadingHints> = new Subject();
  private readonly _modelSubject: Subject<CadNode> = new Subject();

  private readonly _updateObservable: Observable<ConsumedSector>;

  constructor(sectorRepository: Repository, sectorCuller: SectorCuller) {
    this._sectorRepository = sectorRepository;
    const modelsArray: CadNode[] = [];
    this._updateObservable = combineLatest(
      this._cameraSubject.pipe(auditTime(1000)),
      this._clippingPlaneSubject.pipe(startWith([])),
      this._clipIntersectionSubject.pipe(startWith(false)),
      this._loadingHintsSubject.pipe(startWith({} as CadLoadingHints)),
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
        ([_camera, _clippingPlanes, _clipIntersection, loadingHints, cadNodes]) =>
          cadNodes.length > 0 && loadingHints.suspendLoading !== true
      ),
      flatMap(([camera, clippingPlanes, clipIntersection, loadingHints, cadNodes]) => {
        return from(cadNodes).pipe(
          filter(cadNode => cadNode.loadingHints.suspendLoading !== true),
          map(cadNode => cadNode.cadModelMetadata),
          toArray(),
          map(cadModels => {
            const input: DetermineSectorsInput = {
              camera,
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

  updateCamera(camera: THREE.PerspectiveCamera): void {
    this._cameraSubject.next(camera);
  }

  set clippingPlanes(value: THREE.Plane[]) {
    this._clippingPlaneSubject.next(value);
  }

  set clipIntersection(value: boolean) {
    this._clipIntersectionSubject.next(value);
  }

  updateModels(cadModel: CadNode): void {
    this._modelSubject.next(cadModel);
  }

  updateLoadingHints(cadLoadingHints: CadLoadingHints): void {
    this._loadingHintsSubject.next(cadLoadingHints);
  }

  consumedSectorObservable(): Observable<ConsumedSector> {
    return this._updateObservable.pipe(share());
  }

  getLoadingStateObserver(): Observable<boolean> {
    return this._sectorRepository.getLoadingStateObserver();
  }

  getParsedData(): Observable<{ blobUrl: string; lod: string; data: SectorGeometry | SectorQuads }> {
    return this._sectorRepository.getParsedData();
  }
}
