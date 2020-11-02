/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';

import { CadManager } from '@/datamodels/cad/CadManager';
import { PointCloudManager } from '@/datamodels/pointcloud/PointCloudManager';
import {
  SectorNodeIdToTreeIndexMapLoadedListener,
  SectorNodeIdToTreeIndexMapLoadedEvent,
  LoadingStateChangeListener
} from './types';
import { Subscription, combineLatest, asyncScheduler, Subject } from 'rxjs';
import { map, share, filter, observeOn, subscribeOn, tap, auditTime } from 'rxjs/operators';
import { trackError, trackLoadModel, trackCameraNavigation } from '@/utilities/metrics';
import { NodeAppearanceProvider, CadNode } from '@/datamodels/cad';
import { RenderMode } from '@/datamodels/cad/rendering/RenderMode';
import { EffectRenderManager } from '@/datamodels/cad/rendering/EffectRenderManager';
import { SupportedModelTypes } from '@/datamodels/base';
import { LoadingState } from '@/utilities';
import { PointCloudNode } from '@/datamodels/pointcloud/PointCloudNode';
import { CadModelSectorBudget } from '@/datamodels/cad/CadModelBudget';

/* eslint-disable jsdoc/require-jsdoc */

export class RevealManager<TModelIdentifier> {
  private readonly _cadManager: CadManager<TModelIdentifier>;
  private readonly _pointCloudManager: PointCloudManager<TModelIdentifier>;
  private readonly _effectRenderManager: EffectRenderManager;

  private readonly _lastCamera = {
    position: new THREE.Vector3(NaN, NaN, NaN),
    quaternion: new THREE.Quaternion(NaN, NaN, NaN, NaN),
    zoom: NaN
  };

  private _isDisposed = false;
  private readonly _subscriptions = new Subscription();
  private readonly eventListeners = {
    sectorNodeIdToTreeIndexMapLoaded: new Array<SectorNodeIdToTreeIndexMapLoadedListener>(),
    loadingStateChanged: new Array<LoadingStateChangeListener>()
  };

  private readonly _updateSubject: Subject<void>;

  /**
   * @param cadManager
   * @param pointCloudManager
   * @internal
   */
  constructor(cadManager: CadManager<TModelIdentifier>, pointCloudManager: PointCloudManager<TModelIdentifier>) {
    this._cadManager = cadManager;
    this._pointCloudManager = pointCloudManager;
    this._effectRenderManager = new EffectRenderManager(this._cadManager.materialManager);
    this.initLoadingStateObserver(this._cadManager, this._pointCloudManager);
    this._updateSubject = new Subject();
    this._updateSubject
      .pipe(
        auditTime(5000),
        tap(() => {
          trackCameraNavigation({ moduleName: 'RevealManager', methodName: 'update' });
        })
      )
      .subscribe();
  }

  public dispose(): void {
    if (this._isDisposed) {
      return;
    }
    this._cadManager.dispose();
    this._subscriptions.unsubscribe();
    this._isDisposed = true;
  }

  public requestRedraw(): void {
    this._cadManager.requestRedraw();
    this._pointCloudManager.requestRedraw();
  }

  public resetRedraw(): void {
    this._cadManager.resetRedraw();
  }

  get needsRedraw(): boolean {
    return this._cadManager.needsRedraw || this._pointCloudManager.needsRedraw;
  }

  public update(camera: THREE.PerspectiveCamera) {
    const hasCameraChanged =
      this._lastCamera.zoom !== camera.zoom ||
      !this._lastCamera.position.equals(camera.position) ||
      !this._lastCamera.quaternion.equals(camera.quaternion);

    if (hasCameraChanged) {
      this._lastCamera.position.copy(camera.position);
      this._lastCamera.quaternion.copy(camera.quaternion);
      this._lastCamera.zoom = camera.zoom;
      this._cadManager.updateCamera(camera);

      this._updateSubject.next();
    }
  }

  public get cadBudget(): CadModelSectorBudget {
    return this._cadManager.budget;
  }

  public set cadBudget(budget: CadModelSectorBudget) {
    this._cadManager.budget = budget;
  }

  public get renderMode(): RenderMode {
    return this._cadManager.renderMode;
  }

  public set renderMode(renderMode: RenderMode) {
    this._cadManager.renderMode = renderMode;
  }

  public set clippingPlanes(clippingPlanes: THREE.Plane[]) {
    this._cadManager.clippingPlanes = clippingPlanes;
  }

  public get clippingPlanes(): THREE.Plane[] {
    return this._cadManager.clippingPlanes;
  }

  public set clipIntersection(intersection: boolean) {
    this._cadManager.clipIntersection = intersection;
  }

  public get clipIntersection() {
    return this._cadManager.clipIntersection;
  }

  public on(event: 'loadingStateChanged', listener: LoadingStateChangeListener): void;
  public on(event: 'nodeIdToTreeIndexMapLoaded', listener: SectorNodeIdToTreeIndexMapLoadedListener): void;
  public on(
    event: 'loadingStateChanged' | 'nodeIdToTreeIndexMapLoaded',
    listener: LoadingStateChangeListener | SectorNodeIdToTreeIndexMapLoadedListener
  ): void {
    switch (event) {
      case 'loadingStateChanged':
        this.eventListeners.loadingStateChanged.push(listener as LoadingStateChangeListener);
        break;

      case 'nodeIdToTreeIndexMapLoaded':
        this.eventListeners.sectorNodeIdToTreeIndexMapLoaded.push(listener as SectorNodeIdToTreeIndexMapLoadedListener);
        break;

      default:
        throw new Error(`Unsupported event '${event}'`);
    }
  }

  public off(event: 'loadingStateChanged', listener: LoadingStateChangeListener): void;
  public off(event: 'nodeIdToTreeIndexMapLoaded', listener: SectorNodeIdToTreeIndexMapLoadedListener): void;
  public off(
    event: 'loadingStateChanged' | 'nodeIdToTreeIndexMapLoaded',
    listener: LoadingStateChangeListener | SectorNodeIdToTreeIndexMapLoadedListener
  ): void {
    switch (event) {
      case 'loadingStateChanged':
        this.eventListeners.loadingStateChanged = this.eventListeners.loadingStateChanged.filter(x => x !== listener);
        break;

      case 'nodeIdToTreeIndexMapLoaded':
        this.eventListeners.sectorNodeIdToTreeIndexMapLoaded = this.eventListeners.sectorNodeIdToTreeIndexMapLoaded.filter(
          x => x !== listener
        );
        break;

      default:
        throw new Error(`Unsupported event '${event}'`);
    }
  }

  public render(renderer: THREE.WebGLRenderer, camera: THREE.PerspectiveCamera, scene: THREE.Scene) {
    this._effectRenderManager.render(renderer, camera, scene);
  }

  public addModel(
    type: 'cad',
    modelIdentifier: TModelIdentifier,
    nodeAppearanceProvider?: NodeAppearanceProvider
  ): Promise<CadNode>;
  public addModel(type: 'pointcloud', modelIdentifier: TModelIdentifier): Promise<PointCloudNode>;
  public async addModel(
    type: SupportedModelTypes,
    modelIdentifier: TModelIdentifier,
    nodeAppearanceProvider?: NodeAppearanceProvider
  ): Promise<PointCloudNode | CadNode> {
    trackLoadModel(
      {
        moduleName: 'RevealManager',
        methodName: 'addModel',
        type,
        options: { nodeAppearanceProvider }
      },
      modelIdentifier
    );

    switch (type) {
      case 'cad': {
        const cadNode = await this._cadManager.addModel(modelIdentifier, nodeAppearanceProvider);
        this._subscriptions.add(
          this._cadManager
            .getParsedData()
            .pipe(
              share(),
              filter(x => x.blobUrl === cadNode.cadModelMetadata.blobUrl)
            )
            .subscribe(parseSector => {
              this.notifySectorNodeIdToTreeIndexMapLoaded(parseSector.blobUrl, parseSector.data.nodeIdToTreeIndexMap);
            })
        );
        return cadNode;
      }

      case 'pointcloud': {
        return this._pointCloudManager.addModel(modelIdentifier);
      }

      default:
        throw new Error(`Model type '${type}' is not supported`);
    }
  }

  private notifySectorNodeIdToTreeIndexMapLoaded(blobUrl: string, nodeIdToTreeIndexMap: Map<number, number>): void {
    const event: SectorNodeIdToTreeIndexMapLoadedEvent = { blobUrl, nodeIdToTreeIndexMap };
    this.eventListeners.sectorNodeIdToTreeIndexMapLoaded.forEach(listener => {
      listener(event);
    });
  }

  private notifyLoadingStateChanged(loadingState: LoadingState) {
    this.eventListeners.loadingStateChanged.forEach(handler => {
      handler(loadingState);
    });
  }

  private initLoadingStateObserver(
    cadManager: CadManager<TModelIdentifier>,
    pointCloudManager: PointCloudManager<TModelIdentifier>
  ) {
    this._subscriptions.add(
      combineLatest([cadManager.getLoadingStateObserver(), pointCloudManager.getLoadingStateObserver()])
        .pipe(
          observeOn(asyncScheduler),
          subscribeOn(asyncScheduler),
          map(
            ([cadLoadingState, pointCloudLoadingState]) =>
              ({
                isLoading: cadLoadingState.isLoading || pointCloudLoadingState.isLoading,
                itemsLoaded: cadLoadingState.itemsLoaded + pointCloudLoadingState.itemsLoaded,
                itemsRequested: cadLoadingState.itemsRequested + pointCloudLoadingState.itemsRequested
              } as LoadingState)
          )
        )
        .subscribe(this.notifyLoadingStateChanged.bind(this), error =>
          trackError(error, {
            moduleName: 'RevealManager',
            methodName: 'constructor'
          })
        )
    );
  }
}
