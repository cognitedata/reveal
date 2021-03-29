/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { CadManager } from '../datamodels/cad/CadManager';
import { PointCloudManager } from '../datamodels/pointcloud/PointCloudManager';
import { LoadingStateChangeListener, defaultRenderOptions } from './types';
import { Subscription, combineLatest, asyncScheduler, Subject } from 'rxjs';
import { map, observeOn, subscribeOn, tap, auditTime, distinctUntilChanged } from 'rxjs/operators';
import { trackError, trackLoadModel, trackCameraNavigation } from '../utilities/metrics';
import { NodeAppearanceProvider, CadNode } from '../datamodels/cad';
import { RenderMode } from '../datamodels/cad/rendering/RenderMode';
import { EffectRenderManager } from '../datamodels/cad/rendering/EffectRenderManager';
import { SupportedModelTypes } from '../datamodels/base';
import { assertNever, LoadingState } from '../utilities';
import { PointCloudNode } from '../datamodels/pointcloud/PointCloudNode';
import { CadModelSectorBudget } from '../datamodels/cad/CadModelSectorBudget';
import { CadModelSectorLoadStatistics } from '../datamodels/cad/CadModelSectorLoadStatistics';
import { RenderOptions } from '..';
import { EventTrigger } from '../utilities/events';

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
  private readonly _events = {
    loadingStateChanged: new EventTrigger<LoadingStateChangeListener>()
  };

  private readonly _updateSubject: Subject<void>;

  constructor(
    cadManager: CadManager<TModelIdentifier>,
    renderManager: EffectRenderManager,
    pointCloudManager: PointCloudManager<TModelIdentifier>
  ) {
    this._effectRenderManager = renderManager;
    this._cadManager = cadManager;
    this._pointCloudManager = pointCloudManager;
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
    this._pointCloudManager.resetRedraw();
  }

  public get renderOptions(): RenderOptions {
    return this._effectRenderManager.renderOptions;
  }

  public set renderOptions(options: RenderOptions) {
    this._effectRenderManager.renderOptions = options ?? defaultRenderOptions;
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

  public get cadLoadedStatistics(): CadModelSectorLoadStatistics {
    return this._cadManager.loadedStatistics;
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

  public on(event: 'loadingStateChanged', listener: LoadingStateChangeListener): void {
    switch (event) {
      case 'loadingStateChanged':
        this._events.loadingStateChanged.subscribe(listener as LoadingStateChangeListener);
        break;

      default:
        throw new Error(`Unsupported event '${event}'`);
    }
  }

  public off(event: 'loadingStateChanged', listener: LoadingStateChangeListener): void {
    switch (event) {
      case 'loadingStateChanged':
        this._events.loadingStateChanged.unsubscribe(listener as LoadingStateChangeListener);
        break;

      default:
        throw new Error(`Unsupported event '${event}'`);
    }
  }

  public render(camera: THREE.PerspectiveCamera, scene: THREE.Scene) {
    this._effectRenderManager.render(camera, scene);
  }

  /**
   * Overrides the default rendering target.
   * @param target New rendering target.
   * @param autoSetTargetSize Auto size target to fit canvas.
   */
  public setRenderTarget(target: THREE.WebGLRenderTarget | null, autoSetTargetSize: boolean = true) {
    this._effectRenderManager.setRenderTarget(target, autoSetTargetSize);
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
        return this._cadManager.addModel(modelIdentifier, nodeAppearanceProvider);
      }

      case 'pointcloud': {
        return this._pointCloudManager.addModel(modelIdentifier);
      }

      default:
        throw new Error(`Model type '${type}' is not supported`);
    }
  }

  public removeModel(type: 'cad', model: CadNode): void;
  public removeModel(type: 'pointcloud', model: PointCloudNode): void;
  public removeModel(type: 'cad' | 'pointcloud', model: CadNode | PointCloudNode): void {
    switch (type) {
      case 'cad':
        this._cadManager.removeModel(model as CadNode);
        break;

      case 'pointcloud':
        this._pointCloudManager.removeModel(model as PointCloudNode);
        break;

      default:
        assertNever(type);
    }
  }

  private notifyLoadingStateChanged(loadingState: LoadingState) {
    this._events.loadingStateChanged.fire(loadingState);
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
          ),
          distinctUntilChanged((x, y) => x.itemsLoaded === y.itemsLoaded && x.itemsRequested === y.itemsRequested)
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
