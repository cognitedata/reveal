/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import {
  Subject,
  Observable,
  combineLatest,
  from,
  fromEventPattern,
  asyncScheduler,
  scheduled,
  queueScheduler
} from 'rxjs';
import { CadNode } from './CadNode';
import {
  scan,
  share,
  startWith,
  auditTime,
  filter,
  map,
  publish,
  flatMap,
  toArray,
  tap,
  distinctUntilChanged,
  mergeAll,
  observeOn
} from 'rxjs/operators';
import { SectorCuller } from './sector/culling/SectorCuller';
import { DetermineSectorsInput } from './sector/culling/types';
import { CadLoadingHints } from './CadLoadingHints';
import { ConsumedSector, WantedSector, SectorGeometry } from './sector/types';
import { distinctUntilLevelOfDetailChanged } from './sector/sectorUtilities';
import { LevelOfDetail } from './sector/LevelOfDetail';
import { Repository } from './sector/Repository';
import { SectorQuads } from './rendering/types';
import { emissionLastMillis } from '@/utilities';
import { CadModelMetadata } from '.';

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
    this._updateObservable = combineLatest([
      this._cameraSubject.pipe(auditTime(1000)),
      this._clippingPlaneSubject.pipe(startWith([])),
      this._clipIntersectionSubject.pipe(startWith(false)),
      this._loadingHintsSubject.pipe(startWith({} as CadLoadingHints)),
      this._cameraSubject.pipe(auditTime(250), emissionLastMillis(600)),
      this.loadingModelObservable()
    ]).pipe(
      observeOn(asyncScheduler),
      auditTime(250),
      filter(
        ([_camera, _clippingPlanes, _clipIntersection, loadingHints, _cameraInMotion, cadModelsMetadata]) =>
          cadModelsMetadata.length > 0 && loadingHints.suspendLoading !== true
      ),
      map(([camera, clippingPlanes, clipIntersection, loadingHints, cameraInMotion, cadModelsMetadata]) => {
        const input: DetermineSectorsInput = {
          camera,
          cameraInMotion,
          clippingPlanes,
          clipIntersection,
          loadingHints,
          cadModelsMetadata
        };
        return sectorCuller.determineSectors(input);
      }),
      // Load sectors from repository
      publish((wantedSectors: Observable<WantedSector[]>) => {
        const modelSectorStates: { [blobUrl: string]: { [id: number]: LevelOfDetail } } = {};

        const filterDiscarded = filter<WantedSector>(
          wantedSector => wantedSector.levelOfDetail === LevelOfDetail.Discarded
        );
        const discardedSectorsObservable = wantedSectors.pipe(mergeAll(), filterDiscarded);

        const filterSimpleAndDetailed = filter<WantedSector>(
          wantedSector =>
            wantedSector.levelOfDetail === LevelOfDetail.Simple || wantedSector.levelOfDetail === LevelOfDetail.Detailed
        );

        const filterUnloadedSectors = filter<WantedSector>(wantedSector => {
          const sectorStates = modelSectorStates[wantedSector.blobUrl];
          if (sectorStates) {
            const sectorState = sectorStates[wantedSector.metadata.id];
            return sectorState !== wantedSector.levelOfDetail;
          }
          return true;
        });

        const simpleAndDetailedSectorsObservable = wantedSectors.pipe(
          flatMap(wantedSectorsArray => {
            // TODO: 17-07-2020 j-bjorne adding a scheduled wrapping the from
            return from(wantedSectorsArray).pipe(filterSimpleAndDetailed, filterUnloadedSectors, toArray());
          })
        );

        return scheduled(
          [
            discardedSectorsObservable.pipe(
              map(wantedSector => ({ ...wantedSector, group: undefined } as ConsumedSector))
            ),
            simpleAndDetailedSectorsObservable.pipe(sectorRepository.loadSector())
          ],
          queueScheduler
        ).pipe(
          mergeAll(),
          // TODO 16-07-2020 j-bjorne: Might not actually be needed due to switch map logic. If not need to investigate if stale sectors are shown.
          // filterCurrentWantedSectors(wantedSectors),
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
      })
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

  private loadingModelObservable() {
    return this._modelSubject.pipe(
      publish(modelObservable => {
        return modelObservable.pipe(
          flatMap(
            cadNode => {
              return fromEventPattern<Readonly<CadLoadingHints>>(
                h => cadNode.on('loadingHintsChanged', h),
                h => cadNode.off('loadingHintsChanged', h)
              ).pipe(startWith(cadNode.loadingHints), distinctUntilChanged());
            },
            (cadNode, loadingHints) => ({ cadNode, loadingHints })
          ),
          scan((array, next) => {
            const { cadNode, loadingHints } = next;
            if (loadingHints && !loadingHints.suspendLoading) {
              array.push(cadNode.cadModelMetadata);
            } else {
              return array.filter(x => x !== cadNode.cadModelMetadata);
            }
            return array;
          }, [] as CadModelMetadata[])
        );
      })
    );
  }
}
