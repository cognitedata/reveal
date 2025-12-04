/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import isEqual from 'lodash/isEqual';

import { Subscription, combineLatest, fromEventPattern } from 'rxjs';
import { PointCloudBudget } from './types';

import { GeometryFilter, CadModelSectorLoadStatistics, CadNode } from '@reveal/cad-model';
import { PointCloudManager, PointCloudNode } from '@reveal/pointclouds';
import { SupportedModelTypes, LoadingState } from '@reveal/model-base';
import { CadManager, CadModelBudget } from '@reveal/cad-geometry-loaders';
import { NodeAppearanceProvider } from '@reveal/cad-styling';
import {
  RenderMode,
  RenderPipelineExecutor,
  CadMaterialManager,
  RenderPipelineProvider,
  ResizeHandler,
  SettableRenderTarget
} from '@reveal/rendering';
import { assertNever, EventTrigger } from '@reveal/utilities';
import { CameraManager } from '@reveal/camera-manager';

import {
  ClassicModelIdentifierType,
  DataSourceType,
  InternalDataSourceType,
  LocalModelIdentifierType
} from '@reveal/data-providers';
import { createModelIdentifier } from '@reveal/data-providers';
import { AddModelOptionsWithModelRevisionId } from '../../../data-providers/src/utilities/internalAddModelOptions';

/* eslint-disable jsdoc/require-jsdoc */

export type AddCadModelOptions = {
  nodeAppearanceProvider?: NodeAppearanceProvider;
  geometryFilter?: GeometryFilter;
};

/**
 * Handler for events about data being loaded.
 */
export type LoadingStateChangeListener = (loadingState: LoadingState) => any;

export class RevealManager {
  private readonly _cadManager: CadManager;
  private readonly _pointCloudManager: PointCloudManager;
  private readonly _pipelineExecutor: RenderPipelineExecutor;
  private readonly _renderPipeline: RenderPipelineProvider & SettableRenderTarget;
  private readonly _resizeHandler: ResizeHandler;

  private _cameraInMotion: boolean = false;

  private _isDisposed = false;
  private readonly _subscriptions;
  private readonly _events = {
    loadingStateChanged: new EventTrigger<LoadingStateChangeListener>()
  };

  private readonly _cameraManager: CameraManager;

  private readonly _onCameraChange: (position: THREE.Vector3, target: THREE.Vector3) => void;
  private readonly _onCameraStop: () => void;

  constructor(
    cadManager: CadManager,
    pointCloudManager: PointCloudManager,
    pipelineExecutor: RenderPipelineExecutor,
    renderPipeline: RenderPipelineProvider & SettableRenderTarget,
    resizeHandler: ResizeHandler,
    cameraManager: CameraManager
  ) {
    this._pipelineExecutor = pipelineExecutor;
    this._renderPipeline = renderPipeline;
    this._cadManager = cadManager;
    this._pointCloudManager = pointCloudManager;
    this._resizeHandler = resizeHandler;
    this._subscriptions = this.initLoadingStateObserver(this._cadManager, this._pointCloudManager);

    this._cameraManager = cameraManager;
    this._onCameraChange = (_position: THREE.Vector3, _target: THREE.Vector3) => (this._cameraInMotion = true);
    this._onCameraStop = () => (this._cameraInMotion = false);
    this._cameraManager.on('cameraChange', this._onCameraChange);
    this._cameraManager.on('cameraStop', this._onCameraStop);
  }

  public dispose(): void {
    if (this._isDisposed) {
      return;
    }
    this._cadManager.dispose();
    this._pointCloudManager.dispose();
    this._pipelineExecutor.dispose();
    this._renderPipeline.dispose();
    this._resizeHandler.dispose();
    this._subscriptions.unsubscribe();
    this._isDisposed = true;

    this._cameraManager.off('cameraChange', this._onCameraChange);
    this._cameraManager.off('cameraStop', this._onCameraStop);
  }

  public requestRedraw(): void {
    this._cadManager.requestRedraw();
    this._pointCloudManager.requestRedraw();
  }

  public resetRedraw(): void {
    this._cadManager.resetRedraw();
    this._pointCloudManager.resetRedraw();
    this._resizeHandler.resetRedraw();
  }

  public setOutputRenderTarget(target: THREE.WebGLRenderTarget | null, autoSizeRenderTarget?: boolean): void {
    this._renderPipeline.setOutputRenderTarget(target, autoSizeRenderTarget);
  }

  get materialManager(): CadMaterialManager {
    return this._cadManager.materialManager;
  }

  get needsRedraw(): boolean {
    return this._cadManager.needsRedraw || this._pointCloudManager.needsRedraw || this._resizeHandler.needsRedraw;
  }

  public update(camera: THREE.PerspectiveCamera): void {
    this._cadManager.updateCamera(camera, this._cameraInMotion);

    if (this._cameraInMotion) {
      this._pointCloudManager.updateCamera(camera);
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

  public getResolutionThreshold(): number {
    return this._resizeHandler.getStoppedCameraResolutionThreshold();
  }

  public setResolutionThreshold(threshold: number): void {
    this._resizeHandler.setResolutionThreshold(threshold);
    this.requestRedraw();
  }

  public getMovingCameraResolutionFactor(): number {
    return this._resizeHandler.getMovingCameraResolutionFactor();
  }

  public setMovingCameraResolutionFactor(factor: number): void {
    this._resizeHandler.setMovingCameraResolutionFactor(factor);
    this.requestRedraw();
  }

  public render(camera: THREE.PerspectiveCamera): void {
    this._resizeHandler.handleResize(camera);
    this._pipelineExecutor.render(this._renderPipeline, camera);
    this.resetRedraw();
  }

  public addModel<T extends InternalDataSourceType>(
    type: 'cad',
    modelIdentifier: AddModelOptionsWithModelRevisionId<T>,
    options?: AddCadModelOptions
  ): Promise<CadNode>;
  public addModel<T extends DataSourceType>(
    type: 'pointcloud',
    modelIdentifier: AddModelOptionsWithModelRevisionId<T>
  ): Promise<PointCloudNode<T>>;
  public async addModel<T extends DataSourceType>(
    type: SupportedModelTypes,
    modelIdentifier: AddModelOptionsWithModelRevisionId<T>,
    options?: AddCadModelOptions
  ): Promise<PointCloudNode<T> | CadNode> {
    switch (type) {
      case 'cad': {
        return this._cadManager.addModel(
          createModelIdentifier(modelIdentifier as ClassicModelIdentifierType | LocalModelIdentifierType),
          (options as AddCadModelOptions).geometryFilter
        );
      }

      case 'pointcloud': {
        return this._pointCloudManager.addModel<T>(
          modelIdentifier,
          createModelIdentifier({ ...modelIdentifier, ...modelIdentifier.classicModelRevisionId })
        );
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

  private initLoadingStateObserver(cadManager: CadManager, pointCloudManager: PointCloudManager): Subscription {
    let lastLoadingState: LoadingState | undefined;

    return combineLatest([
      fromEventPattern<LoadingState>(
        eventHandler => cadManager.on('loadingStateChanged', eventHandler),
        eventHandler => cadManager.off('loadingStateChanged', eventHandler)
      ),
      pointCloudManager.getLoadingStateObserver()
    ]).subscribe(([cadLoadingState, pointCloudLoadingState]) => {
      const state: LoadingState = {
        isLoading: cadLoadingState.isLoading || pointCloudLoadingState.isLoading,
        itemsLoaded: cadLoadingState.itemsLoaded + pointCloudLoadingState.itemsLoaded,
        itemsRequested: cadLoadingState.itemsRequested + pointCloudLoadingState.itemsRequested,
        itemsCulled: cadLoadingState.itemsCulled + pointCloudLoadingState.itemsCulled
      };

      if (isEqual(state, lastLoadingState)) {
        return;
      }

      lastLoadingState = state;
      this._events.loadingStateChanged.fire(state);
    });
  }
}
