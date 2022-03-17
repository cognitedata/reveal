/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { Subscription, combineLatest, asyncScheduler, Subject } from 'rxjs';
import { map, observeOn, subscribeOn, tap, auditTime, distinctUntilChanged } from 'rxjs/operators';
import { LoadingStateChangeListener, PointCloudBudget } from './types';

import { CadManager, GeometryFilter, CadModelSectorLoadStatistics } from '@reveal/cad-model';
import { PointCloudManager, PointCloudNode } from '@reveal/pointclouds';
import { SupportedModelTypes, LoadingState } from '@reveal/model-base';
import { CadModelBudget } from '@reveal/cad-geometry-loaders';
import { NodeAppearanceProvider } from '@reveal/cad-styling';
import { RenderOptions, EffectRenderManager, CadNode, defaultRenderOptions, RenderMode } from '@reveal/rendering';
import { MetricsLogger } from '@reveal/metrics';
import { assertNever, EventTrigger } from '@reveal/utilities';

import { ModelIdentifier } from '@reveal/modeldata-api';

/* eslint-disable jsdoc/require-jsdoc */

export type AddCadModelOptions = {
  nodeAppearanceProvider?: NodeAppearanceProvider;
  geometryFilter?: GeometryFilter;
};

export class RevealManager {
  private readonly _cadManager: CadManager;
  private readonly _pointCloudManager: PointCloudManager;
  private readonly _effectRenderManager: EffectRenderManager;
  private readonly _renderer: THREE.WebGLRenderer;

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

  constructor(cadManager: CadManager, renderManager: EffectRenderManager, pointCloudManager: PointCloudManager, renderer: THREE.WebGLRenderer) {
    this._effectRenderManager = renderManager;
    this._cadManager = cadManager;
    this._pointCloudManager = pointCloudManager;
    this._renderer = renderer;
    this.initLoadingStateObserver(this._cadManager, this._pointCloudManager);
    this._updateSubject = new Subject();
    this._updateSubject
      .pipe(
        auditTime(5000),
        tap(() => {
          MetricsLogger.trackCameraNavigation({ moduleName: 'RevealManager', methodName: 'update' });
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

  public get debugRenderTiming(): boolean {
    return this._effectRenderManager.debugRenderTimings;
  }

  public set debugRenderTiming(enable: boolean) {
    this._effectRenderManager.debugRenderTimings = enable;
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

  public update(camera: THREE.PerspectiveCamera): void {
    const hasCameraChanged =
      this._lastCamera.zoom !== camera.zoom ||
      !this._lastCamera.position.equals(camera.position) ||
      !this._lastCamera.quaternion.equals(camera.quaternion);

    if (hasCameraChanged) {
      this._pointCloudManager.pointCloudGroupWrapper.potreeInstance.updatePointClouds(
        this._pointCloudManager.pointCloudGroupWrapper.pointClouds,
        camera,
        this._renderer);

      this._lastCamera.position.copy(camera.position);
      this._lastCamera.quaternion.copy(camera.quaternion);
      this._lastCamera.zoom = camera.zoom;
      this._cadManager.updateCamera(camera);

      this._updateSubject.next();
    }
  }

  public get cadBudget(): CadModelBudget {
    return this._cadManager.budget;
  }

  public set cadBudget(budget: CadModelBudget) {
    this._cadManager.budget = budget;
  }

  public get cadLoadedStatistics(): CadModelSectorLoadStatistics {
    return this._cadManager.loadedStatistics;
  }

  public get cadRenderMode(): RenderMode {
    return this._cadManager.renderMode;
  }

  public set cadRenderMode(renderMode: RenderMode) {
    this._cadManager.renderMode = renderMode;
  }

  public get pointCloudBudget(): PointCloudBudget {
    return { numberOfPoints: this._pointCloudManager.pointBudget };
  }

  public set pointCloudBudget(budget: PointCloudBudget) {
    this._pointCloudManager.pointBudget = budget.numberOfPoints;
  }

  public set clippingPlanes(clippingPlanes: THREE.Plane[]) {
    this._cadManager.clippingPlanes = clippingPlanes;
    this._pointCloudManager.clippingPlanes = clippingPlanes;
  }

  public get clippingPlanes(): THREE.Plane[] {
    return this._cadManager.clippingPlanes;
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

  public render(camera: THREE.PerspectiveCamera): void {
    this._effectRenderManager.render(camera);
    this.resetRedraw();
  }

  /**
   * Overrides the default rendering target.
   * @param target New rendering target.
   * @param autoSetTargetSize Auto size target to fit canvas.
   */
  public setRenderTarget(target: THREE.WebGLRenderTarget | null, autoSetTargetSize: boolean = true): void {
    this._effectRenderManager.setRenderTarget(target);
    this._effectRenderManager.setRenderTargetAutoSize(autoSetTargetSize);
  }

  public addModel(type: 'cad', modelIdentifier: ModelIdentifier, options?: AddCadModelOptions): Promise<CadNode>;
  public addModel(type: 'pointcloud', modelIdentifier: ModelIdentifier): Promise<PointCloudNode>;
  public async addModel(
    type: SupportedModelTypes,
    modelIdentifier: ModelIdentifier,
    options?: AddCadModelOptions
  ): Promise<PointCloudNode | CadNode> {
    switch (type) {
      case 'cad': {
        return this._cadManager.addModel(modelIdentifier, options?.geometryFilter);
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

  public addUiObject(object: THREE.Object3D, screenPos: THREE.Vector2, size: THREE.Vector2): void {
    this._effectRenderManager.addUiObject(object, screenPos, size);
    this.requestRedraw();
  }

  public removeUiObject(object: THREE.Object3D): void {
    this._effectRenderManager.removeUiObject(object);
    this.requestRedraw();
  }

  private notifyLoadingStateChanged(loadingState: LoadingState) {
    this._events.loadingStateChanged.fire(loadingState);
  }

  private initLoadingStateObserver(cadManager: CadManager, pointCloudManager: PointCloudManager) {
    this._subscriptions.add(
      combineLatest([cadManager.getLoadingStateObserver(), pointCloudManager.getLoadingStateObserver()])
        .pipe(
          observeOn(asyncScheduler),
          subscribeOn(asyncScheduler),
          map(([cadLoadingState, pointCloudLoadingState]) => {
            const state: LoadingState = {
              isLoading: cadLoadingState.isLoading || pointCloudLoadingState.isLoading,
              itemsLoaded: cadLoadingState.itemsLoaded + pointCloudLoadingState.itemsLoaded,
              itemsRequested: cadLoadingState.itemsRequested + pointCloudLoadingState.itemsRequested,
              itemsCulled: cadLoadingState.itemsCulled + pointCloudLoadingState.itemsCulled
            };
            return state;
          }),
          distinctUntilChanged((x, y) => x.itemsLoaded === y.itemsLoaded && x.itemsRequested === y.itemsRequested)
        )
        .subscribe(this.notifyLoadingStateChanged.bind(this), error =>
          MetricsLogger.trackError(error, {
            moduleName: 'RevealManager',
            methodName: 'constructor'
          })
        )
    );
  }
}
