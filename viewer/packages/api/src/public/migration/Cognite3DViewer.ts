/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';
import viewerPackageJson from '../../../../../package.json' assert { type: 'json' };

import TWEEN from '@tweenjs/tween.js';
import { Subscription, fromEventPattern } from 'rxjs';
import pick from 'lodash/pick';

import { defaultRenderOptions, EdlOptions } from '@reveal/rendering';

import {
  assertNever,
  EventTrigger,
  InputHandler,
  disposeOfAllEventListeners,
  worldToNormalizedViewportCoordinates,
  worldToViewportCoordinates,
  PointerEventDelegate,
  SceneRenderedDelegate,
  DisposedDelegate,
  determineCurrentDevice,
  SceneHandler,
  BeforeSceneRenderedDelegate
} from '@reveal/utilities';

import { MetricsLogger } from '@reveal/metrics';
import { PickingHandler, CadModelSectorLoadStatistics, CogniteCadModel } from '@reveal/cad-model';
import {
  PointCloudIntersection,
  PointCloudBudget,
  CognitePointCloudModel,
  PointCloudPickingHandler
} from '@reveal/pointclouds';

import {
  AddImage360Options,
  AddModelOptions,
  Cognite3DViewerOptions,
  Intersection,
  CadModelBudget,
  CadIntersection,
  ResolutionOptions
} from './types';
import { RevealManager } from '../RevealManager';
import { CogniteModel } from '../types';
import { RevealOptions } from '../RevealOptions';

import { Spinner } from '../../utilities/Spinner';

import { ViewerState, ViewStateHelper } from '../../utilities/ViewStateHelper';
import { RevealManagerHelper } from '../../storage/RevealManagerHelper';

import { DefaultCameraManager, CameraManager, CameraChangeDelegate, ProxyCameraManager } from '@reveal/camera-manager';
import { CdfModelIdentifier, File3dFormat } from '@reveal/data-providers';
import { DataSource, CdfDataSource, LocalDataSource } from '@reveal/data-source';
import { IntersectInput, SupportedModelTypes, LoadingState } from '@reveal/model-base';

import { CogniteClient } from '@cognite/sdk';
import { Log } from '@reveal/logger';
import {
  determineAntiAliasingMode,
  determineResolutionCap,
  determineSsaoRenderParameters
} from './renderOptionsHelpers';
import { Image360Collection, Image360Entity } from '@reveal/360-images';
import { Image360ApiHelper } from '../../api-helpers/Image360ApiHelper';
import html2canvas from 'html2canvas';
import { Image360 } from '@reveal/360-images/src/Image360';

type Cognite3DViewerEvents = 'click' | 'hover' | 'cameraChange' | 'beforeSceneRendered' | 'sceneRendered' | 'disposed';

/**
 * @example
 * ```js
 * const viewer = new Cognite3DViewer({
 *   noBackground: true,
 *   sdk: CogniteClient({...})
 * });
 * ```
 * @module @cognite/reveal
 */
export class Cognite3DViewer {
  private readonly _domElementResizeObserver: ResizeObserver;
  private readonly _image360ApiHelper: Image360ApiHelper | undefined;

  /**
   * Returns the rendering canvas, the DOM element where the renderer draws its output.
   */
  get canvas(): HTMLCanvasElement {
    return this.renderer.domElement;
  }

  /**
   * The DOM element the viewer will insert its rendering canvas into.
   * The DOM element can be specified in the options when the viewer is created.
   * If not specified, the DOM element will be created automatically.
   * The DOM element cannot be changed after the viewer has been created.
   */
  get domElement(): HTMLElement {
    return this._domElement;
  }

  /**
   * Returns the renderer used to produce images from 3D geometry.
   */
  private get renderer(): THREE.WebGLRenderer {
    return this._renderer;
  }

  private readonly _cdfSdkClient: CogniteClient | undefined;
  private readonly _dataSource: DataSource;

  private readonly _sceneHandler: SceneHandler;
  private readonly _activeCameraManager: ProxyCameraManager;
  private readonly _subscription = new Subscription();
  private readonly _revealManagerHelper: RevealManagerHelper;
  private readonly _domElement: HTMLElement;
  private readonly _renderer: THREE.WebGLRenderer;
  private readonly _ownsRenderer: boolean;

  private readonly _pickingHandler: PickingHandler;
  private readonly _pointCloudPickingHandler: PointCloudPickingHandler;

  private readonly _boundAnimate = this.animate.bind(this);

  private readonly _events = {
    cameraChange: new EventTrigger<CameraChangeDelegate>(),
    click: new EventTrigger<PointerEventDelegate>(),
    hover: new EventTrigger<PointerEventDelegate>(),
    beforeSceneRendered: new EventTrigger<BeforeSceneRenderedDelegate>(),
    sceneRendered: new EventTrigger<SceneRenderedDelegate>(),
    disposed: new EventTrigger<DisposedDelegate>()
  };
  private readonly _mouseHandler: InputHandler;

  private readonly _models: CogniteModel[] = [];

  private isDisposed = false;

  private latestRequestId: number = -1;
  private readonly clock = new THREE.Clock();
  private _clippingNeedsUpdate: boolean = false;

  private readonly spinner: Spinner;

  private get revealManager(): RevealManager {
    return this._revealManagerHelper.revealManager;
  }

  /**
   * Reusable buffers used by functions in Cognite3dViewer to avoid allocations.
   */
  private readonly _updateNearAndFarPlaneBuffers = {
    combinedBbox: new THREE.Box3(),
    bbox: new THREE.Box3()
  };

  /**
   * Gets the current budget for downloading geometry for CAD models. Note that this
   * budget is shared between all added CAD models and not a per-model budget.
   */
  public get cadBudget(): CadModelBudget {
    // Note! Type here differs from the one in RevealManager to expose a documented
    // type. This should map 1:1 with type in RevealManager
    return this.revealManager.cadBudget;
  }

  /**
   * Sets the current budget for downloading geometry for CAD models. Note that this
   * budget is shared between all added CAD models and not a per-model budget.
   */
  public set cadBudget(budget: CadModelBudget) {
    // Note! Type here differs from the one in RevealManager to expose a documented
    // type. This should map 1:1 with type in RevealManager
    this.revealManager.cadBudget = budget;
  }

  /**
   * Returns the point cloud budget. The budget is shared between all loaded
   * point cloud models.
   */
  public get pointCloudBudget(): PointCloudBudget {
    return this.revealManager.pointCloudBudget;
  }

  /**
   * Sets the point cloud budget. The budget is shared between all loaded
   * point cloud models.
   */
  public set pointCloudBudget(budget: PointCloudBudget) {
    this.revealManager.pointCloudBudget = budget;
  }

  /**
   * Gets a list of models currently added to the viewer.
   */
  public get models(): CogniteModel[] {
    return this._models.slice();
  }

  /**
   * @internal
   */
  public get cadLoadedStatistics(): CadModelSectorLoadStatistics {
    return this.revealManager.cadLoadedStatistics;
  }

  constructor(options: Cognite3DViewerOptions) {
    const threejsRequiredVersion = viewerPackageJson.peerDependencies.three.split('.')[1].toString();
    if (threejsRequiredVersion != THREE.REVISION) {
      Log.warn(
        `The version of the dependency \"three\" is different from what Reveal expects, which may cause unexpected results.
        In case of unexpected issues, please set the version to ${viewerPackageJson.peerDependencies.three}`
      );
    }
    this._renderer = options.renderer ?? createRenderer();
    this._renderer.localClippingEnabled = true;
    this._ownsRenderer = options.renderer === undefined;

    this.canvas.style.width = '640px';
    this.canvas.style.height = '480px';
    this.canvas.style.minWidth = '100%';
    this.canvas.style.minHeight = '100%';
    this.canvas.style.maxWidth = '100%';
    this.canvas.style.maxHeight = '100%';

    this._domElement = options.domElement ?? createCanvasWrapper();
    this._domElement.tabIndex = 0;
    this._domElement.appendChild(this.canvas);
    this._domElementResizeObserver = this.setupDomElementResizeListener(this._domElement);

    this.spinner = new Spinner(this.domElement);
    this.spinner.placement = options.loadingIndicatorStyle?.placement ?? 'topLeft';
    this.spinner.opacity = Math.max(0.2, options.loadingIndicatorStyle?.opacity ?? 1.0);

    this._sceneHandler = new SceneHandler();

    this._mouseHandler = new InputHandler(this.domElement);

    const initialActiveCameraManager =
      options.cameraManager ??
      new DefaultCameraManager(this._domElement, this._mouseHandler, this.modelIntersectionCallback.bind(this));

    this._activeCameraManager = new ProxyCameraManager(initialActiveCameraManager);

    this._activeCameraManager.on('cameraChange', (position: THREE.Vector3, target: THREE.Vector3) => {
      this._events.cameraChange.fire(position.clone(), target.clone());
    });

    const revealOptions = createRevealManagerOptions(options, this._renderer.getPixelRatio());
    if (options._localModels === true) {
      this._dataSource = new LocalDataSource();
      this._cdfSdkClient = undefined;
      this._revealManagerHelper = RevealManagerHelper.createLocalHelper(
        this._renderer,
        this._sceneHandler,
        this._activeCameraManager,
        revealOptions
      );
    } else if (options.customDataSource !== undefined) {
      this._dataSource = options.customDataSource;
      this._revealManagerHelper = RevealManagerHelper.createCustomDataSourceHelper(
        this._renderer,
        this._sceneHandler,
        this._activeCameraManager,
        revealOptions,
        options.customDataSource
      );
    } else {
      // CDF - default mode
      this._dataSource = new CdfDataSource(options.sdk);
      this._cdfSdkClient = options.sdk;
      this._revealManagerHelper = RevealManagerHelper.createCdfHelper(
        this._renderer,
        this._sceneHandler,
        this._activeCameraManager,
        revealOptions,
        options.sdk
      );
      this._image360ApiHelper = new Image360ApiHelper(
        options.sdk,
        this._sceneHandler,
        this._domElement,
        this._activeCameraManager,
        this._mouseHandler,
        () => this.requestRedraw()
      );
    }

    this.startPointerEventListeners();

    this._pickingHandler = new PickingHandler(
      this._renderer,
      this._revealManagerHelper.revealManager.materialManager,
      this._sceneHandler
    );

    this._pointCloudPickingHandler = new PointCloudPickingHandler(this._renderer);

    this._subscription.add(
      fromEventPattern<LoadingState>(
        h => this.revealManager.on('loadingStateChanged', h),
        h => this.revealManager.off('loadingStateChanged', h)
      ).subscribe(
        loadingState => {
          this.spinner.loading = loadingState.itemsLoaded != loadingState.itemsRequested;
          if (options.onLoading) {
            options.onLoading(loadingState.itemsLoaded, loadingState.itemsRequested, loadingState.itemsCulled);
          }
        },
        error =>
          MetricsLogger.trackError(error, {
            moduleName: 'Cognite3DViewer',
            methodName: 'constructor'
          })
      )
    );

    this.animate(0);

    MetricsLogger.trackEvent('construct3dViewer', {
      constructorOptions: {
        ...pick(options, [
          'logMetrics',
          'antiAliasingHint',
          'ssaoQualityHint',
          'enableEdges',
          'continuousModelStreaming'
        ]),
        cameraManager: options.cameraManager ? true : false,
        customDataSource: options.customDataSource ? true : false
      }
    });
  }

  /**
   * Set options to control resolution of the viewer. This includes
   * settings for max resolution and limiting resolution when moving the camera.
   * @param options Options to apply.
   */
  setResolutionOptions(options: ResolutionOptions): void {
    if (options.maxRenderResolution) {
      this._revealManagerHelper.revealManager.setResolutionThreshold(options.maxRenderResolution);
    }

    if (options.movingCameraResolutionFactor) {
      this._revealManagerHelper.revealManager.setMovingCameraResolutionFactor(options.movingCameraResolutionFactor);
    }
  }

  /**
   * Returns reveal version installed.
   */
  getVersion(): string {
    return process.env.VERSION!;
  }

  /**
   * Sets the log level. Used for debugging.
   * Defaults to 'none' (which is identical to 'silent').
   * @param level
   */
  setLogLevel(level: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'silent' | 'none'): void {
    switch (level) {
      case 'none':
        this.setLogLevel('silent');
        break;
      default:
        Log.setLevel(level);
    }
  }

  /**
   * Dispose of WebGL resources. Can be used to free up memory when the viewer is no longer in use.
   * @see {@link https://threejs.org/docs/#manual/en/introduction/How-to-dispose-of-objects}
   * ```ts
   * // Viewer is no longer in use, free up memory
   * viewer.dispose();
   * ```.
   */
  dispose(): void {
    if (this.isDisposed) {
      return;
    }

    this.isDisposed = true;

    if (this.latestRequestId !== undefined) {
      cancelAnimationFrame(this.latestRequestId);
    }

    for (const model of this._models.values()) {
      this.removeModel(model);
    }

    this._subscription.unsubscribe();
    this._activeCameraManager.dispose();
    this.revealManager.dispose();
    this._image360ApiHelper?.dispose();
    this.domElement.removeChild(this.canvas);
    this._domElementResizeObserver.disconnect();
    if (this._ownsRenderer) {
      this.renderer.dispose();
    }

    this.spinner.dispose();

    this._models.forEach(m => m.dispose());
    this._sceneHandler.dispose();

    this._events.disposed.fire();
    disposeOfAllEventListeners(this._events);
    this._mouseHandler.dispose();
  }

  /**
   * Triggered when the viewer is disposed. Listeners should clean up any
   * resources held and remove the reference to the viewer.
   */
  on(event: 'disposed', callback: DisposedDelegate): void;

  /**
   * @example
   * ```js
   * const onClick = (event) => { console.log(event.offsetX, event.offsetY) };
   * viewer.on('click', onClick);
   * ```
   */
  on(event: 'click' | 'hover', callback: PointerEventDelegate): void;
  /**
   * @example
   * ```js
   * viewer.on('cameraChange', (position, target) => {
   *   console.log('Camera changed: ', position, target);
   * });
   * ```
   */
  on(event: 'cameraChange', callback: CameraChangeDelegate): void;
  /**
   * Event that is triggered immediately before the scene is rendered.
   * @param event Metadata about the rendering frame.
   * @param callback Callback to trigger when event occurs.
   */
  on(event: 'beforeSceneRendered', callback: BeforeSceneRenderedDelegate): void;
  /**
   * Event that is triggered immediately after the scene has been rendered.
   * @param event Metadata about the rendering frame.
   * @param callback Callback to trigger when the event occurs.
   */
  on(event: 'sceneRendered', callback: SceneRenderedDelegate): void;
  /**
   * Add event listener to the viewer.
   * Call {@link Cognite3DViewer.off} to remove an event listener.
   * @param event
   * @param callback
   */
  on(
    event: Cognite3DViewerEvents,
    callback:
      | PointerEventDelegate
      | CameraChangeDelegate
      | BeforeSceneRenderedDelegate
      | SceneRenderedDelegate
      | DisposedDelegate
  ): void {
    switch (event) {
      case 'click':
        this._events.click.subscribe(callback as PointerEventDelegate);
        break;

      case 'hover':
        this._events.hover.subscribe(callback as PointerEventDelegate);
        break;

      case 'cameraChange':
        this._events.cameraChange.subscribe(callback as CameraChangeDelegate);
        break;

      case 'beforeSceneRendered':
        this._events.beforeSceneRendered.subscribe(callback as BeforeSceneRenderedDelegate);
        break;

      case 'sceneRendered':
        this._events.sceneRendered.subscribe(callback as SceneRenderedDelegate);
        break;

      case 'disposed':
        this._events.disposed.subscribe(callback as DisposedDelegate);
        break;

      default:
        assertNever(event);
    }
  }

  /**
   * @example
   * ```js
   * viewer.off('click', onClick);
   * ```
   */
  off(event: 'click' | 'hover', callback: PointerEventDelegate): void;
  /**
   * @example
   * ```js
   * viewer.off('cameraChange', onCameraChange);
   * ```
   */
  off(event: 'cameraChange', callback: CameraChangeDelegate): void;
  /**
   * Unsubscribe the 'beforeSceneRendered'-event previously subscribed with {@link on}.
   */
  off(event: 'beforeSceneRendered', callback: BeforeSceneRenderedDelegate): void;
  /**
   * @example
   * ```js
   * viewer.off('sceneRendered', updateStats);
   * ```
   */
  off(event: 'sceneRendered', callback: SceneRenderedDelegate): void;
  /**
   * @example
   * ```js
   * viewer.off('disposed', clearAll);
   * ```
   */
  off(event: 'disposed', callback: DisposedDelegate): void;

  /**
   * Remove event listener from the viewer.
   * Call {@link Cognite3DViewer.on} to add event listener.
   * @param event
   * @param callback
   */
  off(
    event: Cognite3DViewerEvents,
    callback:
      | PointerEventDelegate
      | CameraChangeDelegate
      | BeforeSceneRenderedDelegate
      | SceneRenderedDelegate
      | DisposedDelegate
  ): void {
    switch (event) {
      case 'click':
        this._events.click.unsubscribe(callback as PointerEventDelegate);
        break;

      case 'hover':
        this._events.hover.unsubscribe(callback as PointerEventDelegate);
        break;

      case 'cameraChange':
        this._events.cameraChange.unsubscribe(callback as CameraChangeDelegate);
        break;

      case 'beforeSceneRendered':
        this._events.beforeSceneRendered.unsubscribe(callback as BeforeSceneRenderedDelegate);
        break;

      case 'sceneRendered':
        this._events.sceneRendered.unsubscribe(callback as SceneRenderedDelegate);
        break;

      case 'disposed':
        this._events.disposed.unsubscribe(callback as DisposedDelegate);
        break;

      default:
        assertNever(event);
    }
  }

  get cameraManager(): CameraManager {
    return this._activeCameraManager.innerCameraManager;
  }

  /**
   * Sets the active camera manager instance for current Cognite3Dviewer.
   * @param cameraManager Camera manager instance.
   */
  setCameraManager(cameraManager: CameraManager): void {
    this._activeCameraManager.setActiveCameraManager(cameraManager);
    this.requestRedraw();
  }

  /**
   * Gets the current viewer state which includes the camera pose as well as applied styling.
   * @returns JSON object containing viewer state.
   */
  getViewState(): ViewerState {
    const stateHelper = this.createViewStateHelper();
    return stateHelper.getCurrentState();
  }

  /**
   * Restores camera settings from the state provided, and clears all current styled
   * node collections and applies the `state` object.
   * @param state Viewer state retrieved from {@link Cognite3DViewer.getViewState}.
   */
  setViewState(state: ViewerState): Promise<void> {
    const stateHelper = this.createViewStateHelper();

    this.models
      .filter(model => model instanceof CogniteCadModel)
      .map(model => model as CogniteCadModel)
      .forEach(model => model.removeAllStyledNodeCollections());

    return stateHelper.setState(state);
  }

  /**
   * Add a new model to the viewer.
   * Call {@link Cognite3DViewer.fitCameraToModel} to see the model after the model has loaded.
   * @param options
   * @example
   * ```js
   * const options = {
   * modelId:     'COGNITE_3D_MODEL_ID',
   * revisionId:  'COGNITE_3D_REVISION_ID',
   * };
   * viewer.addModel(options).then(model => {
   * viewer.fitCameraToModel(model, 0);
   * });
   * ```
   */
  async addModel(options: AddModelOptions): Promise<CogniteModel> {
    if (options.localPath !== undefined) {
      throw new Error(
        'addModel() only supports CDF hosted models. Use addCadModel() and addPointCloudModel() to use self-hosted models'
      );
    }

    const type = await this.determineModelType(options.modelId, options.revisionId);
    switch (type) {
      case 'cad':
        return this.addCadModel(options);
      case 'pointcloud':
        return this.addPointCloudModel(options);
      default:
        throw new Error('Model is not supported');
    }
  }

  /**
   * Add a new CAD 3D model to the viewer.
   * Call {@link Cognite3DViewer.fitCameraToModel} to see the model after the model has loaded.
   * @param options
   * @example
   * ```js
   * const options = {
   * modelId:     'COGNITE_3D_MODEL_ID',
   * revisionId:  'COGNITE_3D_REVISION_ID',
   * };
   * viewer.addCadModel(options).then(model => {
   * viewer.fitCameraToModel(model, 0);
   * });
   * ```
   */
  async addCadModel(options: AddModelOptions): Promise<CogniteCadModel> {
    const nodesApiClient = this._dataSource.getNodesApiClient();

    const { modelId, revisionId } = options;
    const cadNode = await this._revealManagerHelper.addCadModel(options);

    const model3d = new CogniteCadModel(modelId, revisionId, cadNode, nodesApiClient);
    this._models.push(model3d);
    this._sceneHandler.addCadModel(cadNode, cadNode.cadModelIdentifier);

    return model3d;
  }

  /**
   * Add a new pointcloud 3D model to the viewer.
   * Call {@link Cognite3DViewer.fitCameraToModel} to see the model after the model has loaded.
   * @param options
   * @example
   * ```js
   * const options = {
   * modelId:     'COGNITE_3D_MODEL_ID',
   * revisionId:  'COGNITE_3D_REVISION_ID',
   * };
   * viewer.addPointCloudModel(options).then(model => {
   * viewer.fitCameraToModel(model, 0);
   * });
   * ```
   */
  async addPointCloudModel(options: AddModelOptions): Promise<CognitePointCloudModel> {
    if (options.geometryFilter) {
      throw new Error('geometryFilter is not supported for point clouds');
    }

    const { modelId, revisionId } = options;
    const pointCloudNode = await this._revealManagerHelper.addPointCloudModel(options);
    const model = new CognitePointCloudModel(modelId, revisionId, pointCloudNode);
    this._models.push(model);

    this._sceneHandler.addPointCloudModel(pointCloudNode, pointCloudNode.modelIdentifier);

    return model;
  }

  /**
   * Adds a set of 360 images to the scene from the /events API in Cognite Data Fusion.
   * @param datasource The CDF data source which holds the references to the 360 image sets.
   * @param eventFilter The metadata filter to apply when querying events that contains the 360 images.
   * @param add360ImageOptions Options for behaviours when adding 360 images.
   * @example
   * ```js
   * const eventFilter = { site_id: "12345" };
   * await viewer.add360ImageSet('events', eventFilter);
   * ```
   */
  async add360ImageSet(
    datasource: 'events',
    eventFilter: { [key: string]: string },
    add360ImageOptions?: AddImage360Options
  ): Promise<Image360Collection> {
    if (datasource !== 'events') {
      throw new Error(`${datasource} is an unknown datasource from 360 images`);
    }

    if (this._cdfSdkClient === undefined || this._image360ApiHelper === undefined) {
      throw new Error(`Adding 360 image sets is only supported when connecting to Cognite Data Fusion`);
    }

    const collectionTransform = add360ImageOptions?.collectionTransform ?? new THREE.Matrix4();
    const preMultipliedRotation = add360ImageOptions?.preMultipliedRotation ?? true;

    const image360Collection = await this._image360ApiHelper.add360ImageSet(
      eventFilter,
      collectionTransform,
      preMultipliedRotation
    );

    return image360Collection;
  }

  /**
   * Remove a set of 360 images.
   * @param image360Entities
   */
  remove360Images(...image360Entities: Image360[]): Promise<void> {
    if (this._cdfSdkClient === undefined || this._image360ApiHelper === undefined) {
      throw new Error(`Adding 360 image sets is only supported when connecting to Cognite Data Fusion`);
    }
    return this._image360ApiHelper.remove360Images(image360Entities.map(entity => entity as Image360Entity));
  }

  /**
   * Enter visualization of a 360 image.
   * @param image360
   */
  enter360Image(image360: Image360): Promise<void> {
    if (this._cdfSdkClient === undefined || this._image360ApiHelper === undefined) {
      throw new Error(`Adding 360 image sets is only supported when connecting to Cognite Data Fusion`);
    }
    return this._image360ApiHelper.enter360Image(image360 as Image360Entity);
  }

  /**
   * Exit visualization of the 360 image.
   */
  exit360Image(): void {
    if (this._cdfSdkClient === undefined || this._image360ApiHelper === undefined) {
      throw new Error(`Adding 360 image sets is only supported when connecting to Cognite Data Fusion`);
    }
    this._image360ApiHelper.exit360Image();
  }

  /**
   * Removes a model that was previously added using {@link Cognite3DViewer.addModel},
   * {@link Cognite3DViewer.addCadModel} or {@link Cognite3DViewer.addPointCloudModel}
   * .
   * @param model
   */
  removeModel(model: CogniteModel): void {
    const modelIdx = this._models.indexOf(model);
    if (modelIdx === -1) {
      throw new Error('Model is not added to viewer');
    }
    this._models.splice(modelIdx, 1);

    switch (model.type) {
      case 'cad':
        const cadModel = model as CogniteCadModel;
        this._sceneHandler.removeCadModel(cadModel.cadNode);
        model.dispose();
        this.revealManager.removeModel(model.type, cadModel.cadNode);

        // This is required because renderer holds references to scenes that were rendered,
        // including geometry on that scenes. `dispose` method removes unused references for
        // removed model.
        this._renderer.renderLists.dispose();
        break;

      case 'pointcloud':
        const pcModel = model as CognitePointCloudModel;
        this._sceneHandler.removePointCloudModel(pcModel.pointCloudNode);
        this.revealManager.removeModel(model.type, pcModel.pointCloudNode);
        break;

      default:
        assertNever(model.type, `Model type ${model.type} cannot be removed`);
    }

    this.revealManager.requestRedraw();
  }

  /**
   * Use to determine of which type the model is.
   *
   * @param modelId The model's id.
   * @param revisionId The model's revision id.
   *
   * @returns Empty string if type is not supported.
   * @example
   * ```typescript
   * const viewer = new Cognite3DViewer(...);
   * const type = await viewer.determineModelType(options.modelId, options.revisionId)
   * let model: CogniteModel
   * switch (type) {
   *   case 'cad':
   *     model = await viewer.addCadModel(options);
   *     break;
   *   case 'pointcloud':
   *     model = await viewer.addPointCloudModel(options);
   *     break;
   *   default:
   *     throw new Error('Model is not supported');
   * }
   * viewer.fitCameraToModel(model);
   * ```
   */
  async determineModelType(modelId: number, revisionId: number): Promise<SupportedModelTypes | ''> {
    if (this._cdfSdkClient === undefined) {
      throw new Error(`${this.determineModelType.name}() is only supported when connecting to Cognite Data Fusion`);
    }

    const modelIdentifier = new CdfModelIdentifier(modelId, revisionId);
    const outputs = await this._dataSource.getModelMetadataProvider().getModelOutputs(modelIdentifier);
    const outputFormats = outputs.map(output => output.format);

    if (hasOutput(File3dFormat.GltfCadModel)) {
      return 'cad';
    } else if (hasOutput(File3dFormat.EptPointCloud)) {
      return 'pointcloud';
    }
    return '';

    function hasOutput(format: File3dFormat) {
      return outputFormats.includes(format);
    }
  }

  /**
   * Add a THREE.Object3D to the viewer.
   * @param object
   * @example
   * ```js
   * const sphere = new THREE.Mesh(
   * new THREE.SphereGeometry(),
   * new THREE.MeshBasicMaterial()
   * );
   * viewer.addObject3D(sphere);
   * ```
   */
  addObject3D(object: THREE.Object3D): void {
    if (this.isDisposed) {
      return;
    }
    object.updateMatrixWorld(true);
    this._sceneHandler.addCustomObject(object);
    this.revealManager.requestRedraw();
    this.recalculateBoundingBox();
  }

  /**
   * Remove a THREE.Object3D from the viewer.
   * @param object
   * @example
   * ```js
   * const sphere = new THREE.Mesh(new THREE.SphereGeometry(), new THREE.MeshBasicMaterial());
   * viewer.addObject3D(sphere);
   * viewer.removeObject3D(sphere);
   * ```
   */
  removeObject3D(object: THREE.Object3D): void {
    if (this.isDisposed) {
      return;
    }
    this._sceneHandler.removeCustomObject(object);
    this.revealManager.requestRedraw();
    this.recalculateBoundingBox();
  }

  /**
   * Sets the color used as the clear color of the renderer.
   * @param backgroundColor
   * @param backgroundColor.color
   * @param backgroundColor.alpha
   */
  setBackgroundColor(backgroundColor: { color?: THREE.Color; alpha?: number }): void {
    if (this.isDisposed) {
      return;
    }

    const color = backgroundColor.color ?? this.renderer.getClearColor(new THREE.Color());
    const alpha = backgroundColor.alpha ?? this.renderer.getClearAlpha();

    this.renderer.setClearColor(color, alpha);
    this.spinner.updateBackgroundColor(color);
    this.requestRedraw();
  }

  /**
   * Sets per-pixel clipping planes. Pixels behind any of the planes will be sliced away.
   * @param clippingPlanes The planes to use for clipping.
   * @example
   * ```js
   * // Hide pixels with values less than 0 in the x direction
   * const plane = new THREE.Plane(new THREE.Vector3(1, 0, 0), 0);
   * viewer.setGlobalClippingPlanes([plane]);
   * ```
   * ```js
   * // Hide pixels with values greater than 20 in the x direction
   *  const plane = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 20);
   * viewer.setGlobalClippingPlanes([plane]);
   * ```
   * ```js
   * // Hide pixels with values less than 0 in the x direction or greater than 0 in the y direction
   * const xPlane = new THREE.Plane(new THREE.Vector3(1, 0, 0), 0);
   * const yPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
   * viewer.setGlobalClippingPlanes([xPlane, yPlane]);
   * ```
   * ```js
   * // Hide pixels behind an arbitrary, non axis-aligned plane
   *  const plane = new THREE.Plane(new THREE.Vector3(1.5, 20, -19), 20);
   * viewer.setGlobalClippingPlanes([plane]);
   * ```
   * ```js
   * // Disable clipping planes
   *  viewer.setGlobalClippingPlanes([]);
   * ```
   */
  setGlobalClippingPlanes(clippingPlanes: THREE.Plane[]): void {
    this.revealManager.clippingPlanes = clippingPlanes;
    this._clippingNeedsUpdate = true;
  }

  /**
   * Sets per-pixel clipping planes. Pixels behind any of the planes will be sliced away.
   * @param clippingPlanes
   * @deprecated Use {@link Cognite3DViewer.setGlobalClippingPlanes} instead.
   */
  setClippingPlanes(clippingPlanes: THREE.Plane[]): void {
    this.setGlobalClippingPlanes(clippingPlanes);
  }

  /**
   * Returns the current active global clipping planes.
   * @deprecated Use {@link Cognite3DViewer.getGlobalClippingPlanes} instead.
   */
  getClippingPlanes(): THREE.Plane[] {
    return this.getGlobalClippingPlanes();
  }

  /**
   * Returns the current active global clipping planes.
   */
  getGlobalClippingPlanes(): THREE.Plane[] {
    return this.revealManager.clippingPlanes.map(p => p.clone());
  }

  /**
   * Attempts to load the camera settings from the settings stored for the
   * provided model. See {@link https://docs.cognite.com/api/v1/#operation/get3DRevision}
   * and {@link https://docs.cognite.com/api/v1/#operation/update3DRevisions} for
   * information on how this setting is retrieved and stored. This setting can
   * also be changed through the 3D models management interface in Cognite Fusion.
   * If no camera configuration is stored in CDF, {@link Cognite3DViewer.fitCameraToModel}
   * is used as a fallback.
   * @param model The model to load camera settings from.
   */
  loadCameraFromModel(model: CogniteModel): void {
    const config = model.getCameraConfiguration();
    if (config) {
      this._activeCameraManager.setCameraState({ position: config.position, target: config.target });
    } else {
      this.fitCameraToModel(model, 0);
    }
  }

  /**
   * Move camera to a place where the 3D model is visible.
   * It uses the bounding box of the 3D model and calls {@link Cognite3DViewer.fitCameraToBoundingBox}.
   * @param model The 3D model.
   * @param duration The duration of the animation moving the camera. Set this to 0 (zero) to disable animation.
   * @example
   * ```js
   * // Fit camera to model
   * viewer.fitCameraToModel(model);
   * ```
   * ```js
   * // Fit camera to model over 500 milliseconds
   * viewer.fitCameraToModel(model, 500);
   * ```
   * ```js
   * // Fit camera to model instantly
   * viewer.fitCameraToModel(model, 0);
   * ```
   */
  fitCameraToModel(model: CogniteModel, duration?: number): void {
    const bounds = model.getModelBoundingBox(new THREE.Box3(), true);
    this._activeCameraManager.fitCameraToBoundingBox(bounds, duration);
  }

  /**
   * Move camera to a place where a set of 3D models are visible.
   * @param models Optional 3D models to focus the camera on. If no models are provided the camera will fit to all models.
   * @param duration The duration of the animation moving the camera. Set this to 0 (zero) to disable animation.
   * @param restrictToMostGeometry If true, attempt to remove junk geometry from the bounds to allow setting a good camera position.
   */
  fitCameraToModels(models?: CogniteModel[], duration?: number, restrictToMostGeometry = false): void {
    const cogniteModels = models ?? this.models;

    if (cogniteModels.length < 1) {
      return;
    }

    const bounds = cogniteModels.reduce<THREE.Box3>((combinedBoundingBox, model) => {
      combinedBoundingBox.union(model.getModelBoundingBox(undefined, restrictToMostGeometry));
      return combinedBoundingBox;
    }, new THREE.Box3());

    this.fitCameraToBoundingBox(bounds, duration);
  }

  /**
   * Move camera to a place where the content of a bounding box is visible to the camera.
   * @param box The bounding box in world space.
   * @param duration The duration of the animation moving the camera. Set this to 0 (zero) to disable animation.
   * @param radiusFactor The ratio of the distance from camera to center of box and radius of the box.
   * @example
   * ```js
   * // Fit camera to bounding box over 500 milliseconds
   * viewer.fitCameraToBoundingBox(boundingBox, 500);
   * ```
   * ```js
   * // Fit camera to bounding box instantaneously
   * viewer.fitCameraToBoundingBox(boundingBox, 0);
   * ```
   * ```js
   * // Place the camera closer to the bounding box
   * viewer.fitCameraToBoundingBox(boundingBox, 500, 2);
   * ```
   */
  fitCameraToBoundingBox(box: THREE.Box3, duration?: number, radiusFactor: number = 2): void {
    this._activeCameraManager.fitCameraToBoundingBox(box, duration, radiusFactor);
  }

  /**
   * Typically used when you perform some changes and can't see them unless you move camera.
   */
  requestRedraw(): void {
    this.revealManager.requestRedraw();
  }

  /**
   * Convert a point in world space to its coordinates in the canvas. This can be used to place HTML objects near 3D objects on top of the 3D viewer.
   * @see {@link https://www.w3schools.com/graphics/canvas_coordinates.asp https://www.w3schools.com/graphics/canvas_coordinates.asp}.
   * @param point World space coordinate.
   * @param normalize Optional. If true, coordinates are normalized into [0,1]. If false, the values are in the range [0, <canvas_size>).
   * @returns Returns 2D coordinates if the point is visible on screen, or `null` if object is outside screen.
   * @example
   * ```js
   * const boundingBoxCenter = new THREE.Vector3();
   * // Find center of bounding box in world space
   * model.getBoundingBox(nodeId).getCenter(boundingBoxCenter);
   * // Screen coordinates of that point
   * const screenCoordinates = viewer.worldToScreen(boundingBoxCenter);
   * ```
   * ```js
   * const boundingBoxCenter = new THREE.Vector3();
   * // Find center of bounding box in world space
   * model.getBoundingBox(nodeId).getCenter(boundingBoxCenter);
   * // Screen coordinates of that point normalized in the range [0,1]
   * const screenCoordinates = viewer.worldToScreen(boundingBoxCenter, true);
   * ```
   * ```js
   * const boundingBoxCenter = new THREE.Vector3();
   * // Find center of bounding box in world space
   * model.getBoundingBox(nodeId).getCenter(boundingBoxCenter);
   * // Screen coordinates of that point
   * const screenCoordinates = viewer.worldToScreen(boundingBoxCenter);
   * if (screenCoordinates == null) {
   *   // Object not visible on screen
   * } else {
   *   // Object is visible on screen
   * }
   * ```
   */
  worldToScreen(point: THREE.Vector3, normalize?: boolean): THREE.Vector2 | null {
    const camera = this.cameraManager.getCamera();
    camera.updateMatrixWorld();
    const screenPosition = new THREE.Vector3();
    if (normalize) {
      worldToNormalizedViewportCoordinates(camera, point, screenPosition);
    } else {
      worldToViewportCoordinates(this.canvas, camera, point, screenPosition);
    }

    if (
      screenPosition.x < 0 ||
      screenPosition.x > 1 ||
      screenPosition.y < 0 ||
      screenPosition.y > 1 ||
      screenPosition.z < 0 ||
      screenPosition.z > 1
    ) {
      // Return null if point is outside camera frustum.
      return null;
    }

    return new THREE.Vector2(screenPosition.x, screenPosition.y);
  }

  /**
   * Take a screenshot from the current camera position. When drawing UI, only the viewer DOM element and its children will be included in the image.
   * The DOM is scaled to fit any provided resolution, and as a result some elements can be positioned incorrectly in regards to the 3D render.
   *
   * `html2canvas` is used to draw UI and this has some limitations on what CSS properties it is able to render. See {@link https://html2canvas.hertzen.com/documentation the html2canvas documentation} for details.
   * @param width Width of the final image. Default is current canvas size.
   * @param height Height of the final image. Default is current canvas size.
   * @param includeUI If false the screenshot will include only the rendered 3D.
   * @returns A {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs Data URL} of the image ('image/png').
   * @example
   * ```js
   * // Take a screenshot with custom resolution
   * const url = await viewer.getScreenshot(1920, 1080);
   * ```
   * ```js
   * // Add a screenshot with resolution of the canvas to the page
   * const url = await viewer.getScreenshot();
   * const image = document.createElement('img');
   * image.src = url;
   * document.body.appendChild(image);
   * ```
   */
  async getScreenshot(width = this.canvas.width, height = this.canvas.height, includeUI = true): Promise<string> {
    if (this.isDisposed) {
      throw new Error('Viewer is disposed');
    }

    const customRenderTarget = this.renderer.getRenderTarget();
    const { width: originalWidth, height: originalHeight } = this.renderer.getSize(new THREE.Vector2());
    const originalPixelRatio = this._renderer.getPixelRatio();

    const originalDomeStyle = {
      position: this.domElement.style.position,
      width: this.domElement.style.width,
      height: this.domElement.style.height,
      margin: this.domElement.style.margin,
      padding: this.domElement.style.padding,
      left: this.domElement.style.left,
      top: this.domElement.style.top
    };

    try {
      // Pause animate while the screenshot renders to stop changes to active camera aspect ratio
      cancelAnimationFrame(this.latestRequestId);

      // Position and scale domElement to match requested resolution.
      // Remove observer temporarily to stop animate from running resize in the background.
      this._domElementResizeObserver.unobserve(this._domElement);
      this.domElement.style.position = 'absolute';
      this.domElement.style.width = width + 'px';
      this.domElement.style.height = height + 'px';
      this.domElement.style.margin = '0px';
      this.domElement.style.padding = '0px';
      this.domElement.style.left = '0px';
      this.domElement.style.top = '0px';

      const screenshotCamera = this.cameraManager.getCamera().clone() as THREE.PerspectiveCamera;
      adjustCamera(screenshotCamera, width, height);

      // Disregard pixelRatio to get the screenshot in requested resolution.
      const pixelRatioOverride = 1;
      this.renderer.setDrawingBufferSize(width, height, pixelRatioOverride);
      if (customRenderTarget) {
        // To ensure that the render is done to the screenshot canvas, we clear the custom
        // render target. This will make the renderer fall back to use the default canvas.
        this.revealManager.setOutputRenderTarget(null);
      }
      this.revealManager.render(screenshotCamera);
      if (!includeUI) return this.canvas.toDataURL();

      // Force update of overlay elements.
      this._events.sceneRendered.fire({
        frameNumber: -1,
        renderTime: -1,
        renderer: this.renderer,
        camera: screenshotCamera
      });

      // Draw screenshot. Again disregarding pixel ratio.
      const outCanvas = await html2canvas(this.domElement, {
        scale: pixelRatioOverride,
        windowHeight: width,
        windowWidth: height,
        width,
        height,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0
      });

      return outCanvas.toDataURL();
    } finally {
      this.domElement.style.position = originalDomeStyle.position;
      this.domElement.style.width = originalDomeStyle.width;
      this.domElement.style.height = originalDomeStyle.height;
      this.domElement.style.margin = originalDomeStyle.margin;
      this.domElement.style.padding = originalDomeStyle.padding;
      this.domElement.style.left = originalDomeStyle.left;
      this.domElement.style.top = originalDomeStyle.top;
      this._domElementResizeObserver.observe(this._domElement);

      if (customRenderTarget) {
        //Restore render target and clear the default canvas.
        this.revealManager.setOutputRenderTarget(customRenderTarget);
        const context = this.renderer.getContext();
        context?.clear(context.COLOR_BUFFER_BIT);
        context?.clear(context.DEPTH_BUFFER_BIT);
      }

      this.renderer.setDrawingBufferSize(originalWidth, originalHeight, originalPixelRatio);
      this.revealManager.render(this.cameraManager.getCamera());

      // Restart animate loop
      this.latestRequestId = requestAnimationFrame(this._boundAnimate);
      this.requestRedraw();
    }
  }

  /**
   * Raycasting model(s) for finding where the ray intersects with the model.
   * @param offsetX X coordinate in pixels (relative to the domElement).
   * @param offsetY Y coordinate in pixels (relative to the domElement).
   * @returns A promise that if there was an intersection then return the intersection object - otherwise it
   * returns `null` if there were no intersections.
   * @see {@link https://en.wikipedia.org/wiki/Ray_casting}.
   *
   * @example For CAD model
   * ```js
   * const offsetX = 50 // pixels from the left
   * const offsetY = 100 // pixels from the top
   * const intersection = await viewer.getIntersectionFromPixel(offsetX, offsetY);
   * if (intersection) // it was a hit
   *   console.log(
   *   'You hit model ', intersection.model,
   *   ' at the node with tree index ', intersection.treeIndex,
   *   ' at this exact point ', intersection.point
   *   );
   * ```
   *
   * @example For point cloud
   * ```js
   * const offsetX = 50 // pixels from the left
   * const offsetY = 100 // pixels from the top
   * const intersection = await viewer.getIntersectionFromPixel(offsetX, offsetY);
   * if (intersection) // it was a hit
   *   console.log(
   *   'You hit model ', intersection.model,
   *   ' at the point index ', intersection.pointIndex,
   *   ' at this exact point ', intersection.point
   *   );
   * ```
   */
  async getIntersectionFromPixel(offsetX: number, offsetY: number): Promise<null | Intersection> {
    if (this._image360ApiHelper !== undefined) {
      const image360Intersection = this._image360ApiHelper.intersect360ImageIcons(offsetX, offsetY);
      if (image360Intersection !== undefined) {
        return null;
      }
    }
    return this.intersectModels(offsetX, offsetY);
  }

  /** @private */
  private getModels(type: 'cad'): CogniteCadModel[];
  /** @private */
  private getModels(type: 'pointcloud'): CognitePointCloudModel[];
  /** @private */
  private getModels(type: SupportedModelTypes): CogniteModel[] {
    return this._models.filter(x => x.type === type);
  }

  /**
   * Creates a helper for managing viewer state.
   */
  private createViewStateHelper(): ViewStateHelper {
    if (this._cdfSdkClient === undefined) {
      throw new Error(`${this.setViewState.name}() is only supported when connecting to Cognite Data Fusion`);
    }
    return new ViewStateHelper(this, this._cdfSdkClient);
  }

  /** @private */
  private animate(time: number) {
    if (this.isDisposed) {
      return;
    }
    this.latestRequestId = requestAnimationFrame(this._boundAnimate);

    const { display, visibility } = window.getComputedStyle(this.canvas);
    const isVisible = visibility === 'visible' && display !== 'none';

    if (isVisible) {
      const camera = this.cameraManager.getCamera();
      TWEEN.update(time);
      this.recalculateBoundingBox();
      this._activeCameraManager.update(this.clock.getDelta(), this._updateNearAndFarPlaneBuffers.combinedBbox);
      this.revealManager.update(camera);

      if (this.revealManager.needsRedraw || this._clippingNeedsUpdate) {
        const frameNumber = this.renderer.info.render.frame;
        const start = Date.now();

        this._events.beforeSceneRendered.fire({ frameNumber, renderer: this.renderer, camera });

        this.revealManager.render(camera);
        this.revealManager.resetRedraw();
        this._clippingNeedsUpdate = false;
        const renderTime = Date.now() - start;

        this._events.sceneRendered.fire({ frameNumber, renderTime, renderer: this.renderer, camera });
      }
    }
  }

  /** @private */
  private async intersectModels(
    offsetX: number,
    offsetY: number,
    options?: { asyncCADIntersection?: boolean }
  ): Promise<null | Intersection> {
    const cadModels = this.getModels('cad');
    const pointCloudModels = this.getModels('pointcloud');
    const cadNodes = cadModels.map(x => x.cadNode);
    const pointCloudNodes = pointCloudModels.map(x => x.pointCloudNode);

    const normalizedCoords = {
      x: (offsetX / this.renderer.domElement.clientWidth) * 2 - 1,
      y: (offsetY / this.renderer.domElement.clientHeight) * -2 + 1
    };

    const input: IntersectInput = {
      normalizedCoords,
      camera: this.cameraManager.getCamera(),
      renderer: this.renderer,
      clippingPlanes: this.getGlobalClippingPlanes(),
      domElement: this.renderer.domElement
    };
    const cadResults = await this._pickingHandler.intersectCadNodes(
      cadNodes,
      input,
      options?.asyncCADIntersection ?? true
    );
    const pointCloudResults = this._pointCloudPickingHandler.intersectPointClouds(pointCloudNodes, input);

    const intersections: Intersection[] = [];
    if (pointCloudResults.length > 0) {
      const result = pointCloudResults[0]; // Nearest intersection
      for (const model of pointCloudModels) {
        if (model.pointCloudNode === result.pointCloudNode) {
          const intersection: PointCloudIntersection = {
            type: 'pointcloud',
            model,
            point: result.point,
            pointIndex: result.pointIndex,
            distanceToCamera: result.distance,
            annotationId: result.annotationId,
            assetRef: result.assetRef
          };
          intersections.push(intersection);
          break;
        }
      }
    }

    if (cadResults.length > 0) {
      const result = cadResults[0]; // Nearest intersection
      for (const model of cadModels) {
        if (model.cadNode === result.cadNode) {
          const intersection: CadIntersection = {
            type: 'cad',
            model,
            treeIndex: result.treeIndex,
            point: result.point,
            distanceToCamera: result.distance
          };
          intersections.push(intersection);
        }
      }
    }

    intersections.sort((a, b) => a.distanceToCamera - b.distanceToCamera);

    return intersections.length > 0 ? intersections[0] : null;
  }

  /**
   * Callback used by DefaultCameraManager to do model intersection. Made synchronous to avoid
   * input lag when zooming in and out. Default implementation is async. See PR #2405 for more info.
   * @private
   */
  private async modelIntersectionCallback(offsetX: number, offsetY: number) {
    const intersection = await this.intersectModels(offsetX, offsetY, { asyncCADIntersection: false });

    return { intersection, modelsBoundingBox: this._updateNearAndFarPlaneBuffers.combinedBbox };
  }

  /** @private */
  private recalculateBoundingBox() {
    // See https://stackoverflow.com/questions/8101119/how-do-i-methodically-choose-the-near-clip-plane-distance-for-a-perspective-proj
    if (this.isDisposed) {
      return;
    }

    const { combinedBbox, bbox } = this._updateNearAndFarPlaneBuffers;

    combinedBbox.makeEmpty();
    this._models.forEach(model => {
      model.getModelBoundingBox(bbox);
      if (!bbox.isEmpty()) {
        combinedBbox.union(bbox);
      }
    });

    this._sceneHandler.customObjects.forEach(obj => {
      bbox.setFromObject(obj);
      if (!bbox.isEmpty()) {
        combinedBbox.union(bbox);
      }
    });
  }

  /** @private */
  private setupDomElementResizeListener(domElement: HTMLElement): ResizeObserver {
    const resizeObserver = new ResizeObserver(() => {
      this.revealManager.requestRedraw();
    });

    resizeObserver.observe(domElement);
    return resizeObserver;
  }

  private readonly startPointerEventListeners = () => {
    this._mouseHandler.on('click', e => {
      this._events.click.fire(e);
    });

    this._mouseHandler.on('hover', e => {
      this._events.hover.fire(e);
    });
  };
}

function adjustCamera(camera: THREE.PerspectiveCamera, width: number, height: number) {
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

function createCanvasWrapper(): HTMLElement {
  const domElement = document.createElementNS('http://www.w3.org/1999/xhtml', 'div');
  domElement.style.width = '100%';
  domElement.style.height = '100%';
  return domElement;
}

function createRenderer(): THREE.WebGLRenderer {
  const renderer = new THREE.WebGLRenderer({ powerPreference: 'high-performance' });
  renderer.setPixelRatio(window.devicePixelRatio);
  return renderer;
}

/**
 * Create EDL options from input options.
 * @param inputOptions
 */
function createCompleteEdlOptions(inputOptions?: Partial<EdlOptions> | 'disabled'): EdlOptions {
  if (inputOptions === undefined) {
    return defaultRenderOptions.pointCloudParameters.edlOptions;
  }

  if (inputOptions === 'disabled') {
    return { radius: 0.0, strength: 0.0 };
  }

  return { ...defaultRenderOptions.pointCloudParameters.edlOptions, ...inputOptions };
}

function createRevealManagerOptions(viewerOptions: Cognite3DViewerOptions, devicePixelRatio: number): RevealOptions {
  const customTarget = viewerOptions.renderTargetOptions?.target;
  const outputRenderTarget = customTarget
    ? {
        target: customTarget,
        autoSize: viewerOptions.renderTargetOptions?.autoSetSize
      }
    : undefined;

  const device = determineCurrentDevice();
  const resolutionCap = determineResolutionCap(viewerOptions.rendererResolutionThreshold, device, devicePixelRatio);

  const revealOptions: RevealOptions = {
    continuousModelStreaming: viewerOptions.continuousModelStreaming,
    outputRenderTarget,
    rendererResolutionThreshold: resolutionCap,
    internal: {}
  };

  revealOptions.internal!.cad = { sectorCuller: viewerOptions._sectorCuller };
  const { antiAliasing, multiSampleCount } = determineAntiAliasingMode(viewerOptions.antiAliasingHint, device);
  const ssaoRenderParameters = determineSsaoRenderParameters(viewerOptions.ssaoQualityHint, device);
  const edgeDetectionParameters = {
    enabled: viewerOptions.enableEdges ?? defaultRenderOptions.edgeDetectionParameters.enabled
  };

  revealOptions.logMetrics = viewerOptions.logMetrics;

  const edlOptions = createCompleteEdlOptions(viewerOptions.pointCloudEffects?.edlOptions);

  revealOptions.renderOptions = {
    antiAliasing,
    multiSampleCountHint: multiSampleCount,
    ssaoRenderParameters,
    edgeDetectionParameters,
    pointCloudParameters: {
      edlOptions,
      pointBlending:
        viewerOptions?.pointCloudEffects?.pointBlending ?? defaultRenderOptions.pointCloudParameters.pointBlending
    }
  };
  return revealOptions;
}
