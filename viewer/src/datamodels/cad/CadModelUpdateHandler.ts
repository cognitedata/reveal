/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
// eslint-disable-next-line prettier/prettier
import {
  Subject,
  Observable,
  combineLatest,
  fromEventPattern,
  asyncScheduler
} from 'rxjs';
import { CadNode } from './CadNode';
import {
  scan,
  share,
  startWith,
  auditTime,
  filter,
  map,
  flatMap,
  distinctUntilChanged,
  finalize,
  observeOn
} from 'rxjs/operators';
import { SectorCuller } from './sector/culling/SectorCuller';
import { CadLoadingHints } from './CadLoadingHints';
import { ConsumedSector, SectorGeometry } from './sector/types';
import { Repository } from './sector/Repository';
import { SectorQuads } from './rendering/types';
import { emissionLastMillis } from '@/utilities';
import { CadModelMetadata } from '.';
import { Progress } from '@/utilities/types';
import {
  createDetermineSectorsInputFromArray,
  loadingEnabled,
  handleDetermineSectorsInput
} from './sector/rxSectorUtilities';

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

    /* Creates and observable that emits an event when either of the observables emitts an item.
     * ------- new camera ---------\
     * --- new clipping plane ------\
     * --- new clip intersection ----\_______ [camera, clippingPlanes, clipIntersection, loadingHints, cameraInMotion, cadmodelsMetadata]
     * --- new global loading hints--/
     * --- new camera motion state -/
     * --- changes in cadmodels ---/
     */
    this._updateObservable = combineLatest([
      this._cameraSubject.pipe(auditTime(500)),
      this._clippingPlaneSubject.pipe(startWith([])),
      this._clipIntersectionSubject.pipe(startWith(false)),
      this._loadingHintsSubject.pipe(startWith({} as CadLoadingHints)),
      this._cameraSubject.pipe(auditTime(250), emissionLastMillis(600)),
      this.loadingModelObservable()
    ]).pipe(
      observeOn(asyncScheduler), // Schedule tasks on macro task queue (setInterval)
      auditTime(250), // Take the last value every 250ms // TODO 07-08-2020 j-bjorne: look into throttle
      map(createDetermineSectorsInputFromArray), // Map from array to interface (enables destructuring)
      filter(loadingEnabled), // should we load?
      handleDetermineSectorsInput(sectorRepository, sectorCuller),
      finalize(() => {
        this._sectorRepository.clear(); // clear the cache once this is unsubscribed from.
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

  getLoadingProgressObserver(): Observable<Progress> {
    return this._sectorRepository.getNetworkProgressObservable();
  }

  getParsedData(): Observable<{ blobUrl: string; lod: string; data: SectorGeometry | SectorQuads }> {
    return this._sectorRepository.getParsedData();
  }

  /* When loading hints of a cadmodel changes, propagate the event down to the stream and either add or remove
   * the cadmodelmetadata from the array and push the new array down stream
   */
  private loadingModelObservable() {
    return this._modelSubject.pipe(
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
  }
}
