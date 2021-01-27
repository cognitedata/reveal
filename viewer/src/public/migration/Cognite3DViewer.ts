/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';

import TWEEN from '@tweenjs/tween.js';
import debounce from 'lodash/debounce';
import omit from 'lodash/omit';
import ComboControls from '@cognite/three-combo-controls';
import { CogniteClient } from '@cognite/sdk';
import { debounceTime, filter, map } from 'rxjs/operators';
import { merge, Subject, Subscription, fromEventPattern, Observable } from 'rxjs';

import { from3DPositionToRelativeViewportCoordinates } from '../../utilities/worldToViewport';
import { intersectCadNodes } from '../../datamodels/cad/picking';

import {
  AddModelOptions,
  Cognite3DViewerOptions,
  GeometryFilter,
  Intersection,
  CameraChangeDelegate,
  PointerEventDelegate,
  CadModelBudget
} from './types';
import { NotSupportedInMigrationWrapperError } from './NotSupportedInMigrationWrapperError';
import RenderController from './RenderController';
import { CogniteModelBase } from './CogniteModelBase';
import { Cognite3DModel } from './Cognite3DModel';
import { CognitePointCloudModel } from './CognitePointCloudModel';
import { RevealManager } from '../RevealManager';
import { createCdfRevealManager } from '../createRevealManager';
import { SceneRenderedDelegate, SectorNodeIdToTreeIndexMapLoadedEvent } from '../types';

import { CdfModelDataClient } from '../../utilities/networking/CdfModelDataClient';
import { assertNever, BoundingBoxClipper, File3dFormat, LoadingState } from '../../utilities';
import { Spinner } from '../../utilities/Spinner';
import { trackError, trackEvent } from '../../utilities/metrics';
import { CdfModelIdentifier } from '../../utilities/networking/types';
import { clickOrTouchEventOffset } from '../../utilities/events';

import { IntersectInput, SupportedModelTypes } from '../../datamodels/base';
import { intersectPointClouds } from '../../datamodels/pointcloud/picking';

import {
  AntiAliasingMode,
  CadIntersection,
  IntersectionFromPixelOptions,
  PointCloudIntersection,
  RevealOptions
} from '../..';
import { PropType } from '../../utilities/reflection';
import { Cognite3DViewerTool, DisposedDelegate } from './Cognite3DViewerTool';
import { HtmlOverlayTool } from '../../tools';

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
  private get canvas(): HTMLCanvasElement {
    return this.renderer.domElement;
  }

  /**
   * For now it just always returns true.
   * @see Https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext#Browser_compatibility.
   */
  static isBrowserSupported(): true {
    return true;
  }

  /**
   * The DOM element the viewer will insert its rendering canvas into.
   * The DOM element can be specified in the options when the viewer is created.
   * If not specified, the DOM element will be created automatically.
   * The DOM element cannot be changed after the viewer has been created.
   */
  readonly domElement: HTMLElement;

  private readonly renderer: THREE.WebGLRenderer;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly scene: THREE.Scene;
  private readonly controls: ComboControls;
  private readonly sdkClient: CogniteClient;
  private readonly _updateCameraNearAndFarSubject: Subject<{ camera: THREE.PerspectiveCamera; force: boolean }>;
  private readonly _subscription = new Subscription();
  private readonly _revealManager: RevealManager<CdfModelIdentifier>;
  private readonly _tools = new Map<Cognite3DViewerTool, DisposedDelegate>();

  private readonly eventListeners = {
    cameraChange: new Array<CameraChangeDelegate>(),
    click: new Array<PointerEventDelegate>(),
    hover: new Array<PointerEventDelegate>(),
    sceneRendered: new Array<SceneRenderedDelegate>()
  };
  private readonly models: CogniteModelBase[] = [];
  private readonly extraObjects: THREE.Object3D[] = [];

  private isDisposed = false;

  private readonly renderController: RenderController;
  private latestRequestId: number = -1;
  private readonly clock = new THREE.Clock();
  private _slicingNeedsUpdate: boolean = false;
  private _geometryFilters: GeometryFilter[] = [];

  private readonly spinner: Spinner;

  /**
   * Reusable buffers used by functions in Cognite3dViewer to avoid allocations.
   */
  private readonly _updateNearAndFarPlaneBuffers = {
    combinedBbox: new THREE.Box3(),
    bbox: new THREE.Box3(),
    cameraPosition: new THREE.Vector3(),
    cameraDirection: new THREE.Vector3(),
    nearPlaneCoplanarPoint: new THREE.Vector3(),
    nearPlane: new THREE.Plane(),
    corners: new Array<THREE.Vector3>(
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3()
    )
  };

  /**
   * Gets the current budget for downloading geometry for CAD models. Note that this
   * budget is shared between all added CAD models and not a per-model budget.
   * @version New in 1.2.0
   */
  public get cadBudget(): CadModelBudget {
    // Note! Type here differes from the one in RevealManager to expose a documentated
    // type. This should map 1:1 with type in RevealManager
    return this._revealManager.cadBudget;
  }

  /**
   * Sets the current budget for downloading geometry for CAD models. Note that this
   * budget is shared between all added CAD models and not a per-model budget.
   * @version New in 1.2.0
   */
  public set cadBudget(budget: CadModelBudget) {
    // Note! Type here differes from the one in RevealManager to expose a documentated
    // type. This should map 1:1 with type in RevealManager
    this._revealManager.cadBudget = budget;
  }

  constructor(options: Cognite3DViewerOptions) {
    if (options.enableCache) {
      throw new NotSupportedInMigrationWrapperError('Cache is not supported');
    }
    if (options.viewCube) {
      throw new NotSupportedInMigrationWrapperError('ViewCube is not supported');
    }

    this.renderer = options.renderer || new THREE.WebGLRenderer();

    this.canvas.style.width = '640px';
    this.canvas.style.height = '480px';
    this.canvas.style.minWidth = '100%';
    this.canvas.style.minHeight = '100%';
    this.canvas.style.maxWidth = '100%';
    this.canvas.style.maxHeight = '100%';
    this.domElement = options.domElement || createCanvasWrapper();
    this.domElement.appendChild(this.canvas);
    this.spinner = new Spinner(this.domElement);

    this.camera = new THREE.PerspectiveCamera(60, undefined, 0.1, 10000);
    this.camera.position.x = 30;
    this.camera.position.y = 10;
    this.camera.position.z = 50;
    this.camera.lookAt(new THREE.Vector3());

    this.scene = new THREE.Scene();
    this.controls = new ComboControls(this.camera, this.canvas);
    this.controls.dollyFactor = 0.992;
    this.controls.addEventListener('cameraChange', event => {
      const { position, target } = event.camera;
      this.eventListeners.cameraChange.forEach(f => {
        f(position.clone(), target.clone());
      });
    });

    this.sdkClient = options.sdk;
    this.renderController = new RenderController(this.camera);

    const revealOptions = createRevealManagerOptions(options);

    this._revealManager = createCdfRevealManager(this.sdkClient, revealOptions);
    this.startPointerEventListeners();

    this._revealManager.setRenderTarget(
      options.renderTargetOptions?.target || null,
      options.renderTargetOptions?.autoSetSize
    );

    this._subscription.add(
      fromEventPattern<LoadingState>(
        h => this._revealManager.on('loadingStateChanged', h),
        h => this._revealManager.off('loadingStateChanged', h)
      ).subscribe(
        loadingState => {
          if (loadingState.itemsLoaded != loadingState.itemsRequested) {
            this.spinner.show();
          } else {
            this.spinner.hide();
          }
          if (options.onLoading) {
            options.onLoading(loadingState.itemsLoaded, loadingState.itemsRequested);
          }
        },
        error =>
          trackError(error, {
            moduleName: 'Cognite3DViewer',
            methodName: 'constructor'
          })
      )
    );

    this._updateCameraNearAndFarSubject = this.setupUpdateCameraNearAndFar();
    this.animate(0);

    trackEvent('construct3dViewer', {
      moduleName: 'Cognite3DViewer',
      methodName: 'constructor',
      constructorOptions: omit(options, ['sdk', 'domElement', 'renderer', '_sectorCuller'])
    });
  }

  /**
   * Returns reveal version installed.
   */
  getVersion(): string {
    return process.env.VERSION;
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

    this._subscription.unsubscribe();
    this._revealManager.dispose();
    this.domElement.removeChild(this.canvas);
    this.renderer.dispose();
    for (const model of this.models.values()) {
      model.dispose();
    }
    this.models.splice(0);
    this.spinner.dispose();
  }

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
   * Event that is triggered immediatly after the scene has been rendered.
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
    event: 'click' | 'hover' | 'cameraChange' | 'sceneRendered',
    callback: PointerEventDelegate | CameraChangeDelegate | SceneRenderedDelegate
  ): void {
    switch (event) {
      case 'click':
        this.eventListeners.click.push(callback as PointerEventDelegate);
        break;

      case 'hover':
        this.eventListeners.hover.push(callback as PointerEventDelegate);
        break;

      case 'cameraChange':
        this.eventListeners.cameraChange.push(callback as CameraChangeDelegate);
        break;

      case 'sceneRendered':
        this.eventListeners.sceneRendered.push(callback as SceneRenderedDelegate);
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
  off(event: 'cameraChange', callback: CameraChangeDelegate): void;
  off(event: 'sceneRendered', callback: SceneRenderedDelegate): void;
  /**
   * Remove event listener from the viewer.
   * Call {@link Cognite3DViewer.on} to add event listener.
   * @param event
   * @param callback
   */
  off(event: 'click' | 'hover' | 'cameraChange' | 'sceneRendered', callback: any): void {
    switch (event) {
      case 'click':
        this.eventListeners.click = this.eventListeners.click.filter(x => x !== callback);
        break;

      case 'hover':
        this.eventListeners.hover = this.eventListeners.hover.filter(x => x !== callback);
        break;

      case 'cameraChange':
        this.eventListeners.cameraChange = this.eventListeners.cameraChange.filter(x => x !== callback);
        break;

      case 'sceneRendered':
        this.eventListeners.sceneRendered = this.eventListeners.sceneRendered.filter(x => x !== callback);
        break;

      default:
        assertNever(event);
    }
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
  async addModel(options: AddModelOptions): Promise<Cognite3DModel | CognitePointCloudModel> {
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
  async addCadModel(options: AddModelOptions): Promise<Cognite3DModel> {
    if (options.localPath) {
      throw new NotSupportedInMigrationWrapperError('localPath is not supported');
    }
    if (options.orthographicCamera) {
      throw new NotSupportedInMigrationWrapperError('ortographicsCamera is not supported');
    }
    if (options.onComplete) {
      throw new NotSupportedInMigrationWrapperError('onComplete is not supported');
    }
    if (options.geometryFilter) {
      this._geometryFilters.push(options.geometryFilter);
      this.setSlicingPlanes(this._revealManager.clippingPlanes);
    }
    const { modelId, revisionId } = options;
    const cadNode = await this._revealManager.addModel('cad', {
      modelId,
      revisionId
    });
    const model3d = new Cognite3DModel(modelId, revisionId, cadNode, this.sdkClient);
    this.models.push(model3d);
    this.scene.add(model3d);
    this._subscription.add(
      fromEventPattern<SectorNodeIdToTreeIndexMapLoadedEvent>(
        h => this._revealManager.on('nodeIdToTreeIndexMapLoaded', h),
        h => this._revealManager.off('nodeIdToTreeIndexMapLoaded', h)
      ).subscribe(event => {
        // TODO 2020-07-05 larsmoa: Fix a better way of identifying a model than blobUrl
        if (event.blobUrl === cadNode.cadModelMetadata.blobUrl) {
          model3d.updateNodeIdMaps(event.nodeIdToTreeIndexMap);
        }
      })
    );

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
    if (options.localPath) {
      throw new NotSupportedInMigrationWrapperError('localPath is not supported');
    }
    if (options.geometryFilter) {
      throw new NotSupportedInMigrationWrapperError('geometryFilter is not supported for point clouds');
    }
    if (options.orthographicCamera) {
      throw new NotSupportedInMigrationWrapperError('ortographicsCamera is not supported');
    }
    if (options.onComplete) {
      throw new NotSupportedInMigrationWrapperError('onComplete is not supported');
    }

    const { modelId, revisionId } = options;
    const pointCloudNode = await this._revealManager.addModel('pointcloud', {
      modelId,
      revisionId
    });
    const model = new CognitePointCloudModel(modelId, revisionId, pointCloudNode);
    this.models.push(model);
    this.scene.add(model);
    return model;
  }

  /**
   * Removes a model that was previously added using {@link Cognite3DViewer.addModel},
   * {@link Cognite3DViewer.addCadModel} or {@link Cognite3DViewer.addPointCloudModel}
   * .
   * @param model
   */
  removeModel(model: Cognite3DModel | CognitePointCloudModel) {
    const modelIdx = this.models.indexOf(model);
    if (modelIdx === -1) {
      throw new Error('Model is not added to viewer');
    }
    this.models.splice(modelIdx, 1);
    this.scene.remove(model);
    this.renderController.redraw();

    switch (model.type) {
      case 'cad':
        const cadModel = model as Cognite3DModel;
        this._revealManager.removeModel(model.type, cadModel.cadNode);
        return;

      case 'pointcloud':
        const pcModel = model as CognitePointCloudModel;
        this._revealManager.removeModel(model.type, pcModel.pointCloudNode);
        return;

      default:
        assertNever(model.type, `Model type ${model.type} cannot be removed`);
    }
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
   * let model: Cognite3DModel | CognitePointCloudModel
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
    const clientExt = new CdfModelDataClient(this.sdkClient);
    const outputs = await clientExt.getOutputs({ modelId, revisionId, format: File3dFormat.AnyFormat });
    if (outputs.findMostRecentOutput(File3dFormat.RevealCadModel) !== undefined) {
      return 'cad';
    } else if (outputs.findMostRecentOutput(File3dFormat.EptPointCloud) !== undefined) {
      return 'pointcloud';
    }
    return '';
  }

  /**
   * Add a THREE.Object3D to the viewer.
   * @param object
   * @example
   * ```js
   * const sphere = new THREE.Mesh(
   * new THREE.SphereBufferGeometry(),
   * new THREE.MeshBasicMaterial()
   * );
   * viewer.addObject3D(sphere);
   * ```
   */
  addObject3D(object: THREE.Object3D): void {
    if (this.isDisposed) {
      return;
    }
    this.scene.add(object);
    this.extraObjects.push(object);
    this.renderController.redraw();
    this.triggerUpdateCameraNearAndFar(true);
  }

  /**
   * Remove a THREE.Object3D from the viewer.
   * @param object
   * @example
   * ```js
   * const sphere = new THREE.Mesh(new THREE.SphereBufferGeometry(), new THREE.MeshBasicMaterial());
   * viewer.addObject3D(sphere);
   * viewer.removeObject3D(sphere);
   * ```
   */
  removeObject3D(object: THREE.Object3D): void {
    if (this.isDisposed) {
      return;
    }
    this.scene.remove(object);
    const index = this.extraObjects.indexOf(object);
    if (index >= 0) {
      this.extraObjects.splice(index, 1);
    }
    this.renderController.redraw();
    this.triggerUpdateCameraNearAndFar(true);
  }

  /**
   * Sets the color used as the clear color of the renderer.
   * @param color
   */
  setBackgroundColor(color: THREE.Color) {
    if (this.isDisposed) {
      return;
    }

    this.renderer.setClearColor(color);
  }

  /**
   * Sets per-pixel slicing planes. Pixels behind any of the planes will be sliced away.
   * @param slicingPlanes The planes to use for slicing.
   * @example
   * ```js
   * // Hide pixels with values less than 0 in the x direction
   * const plane = new THREE.Plane(new THREE.Vector3(1, 0, 0), 0);
   * viewer.setSlicingPlanes([plane]);
   * ```
   * ```js
   * // Hide pixels with values greater than 20 in the x direction
   *  const plane = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 20);
   * viewer.setSlicingPlanes([plane]);
   * ```
   * ```js
   * // Hide pixels with values less than 0 in the x direction or greater than 0 in the y direction
   * const xPlane = new THREE.Plane(new THREE.Vector3(1, 0, 0), 0);
   * const yPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
   * viewer.setSlicingPlanes([xPlane, yPlane]);
   * ```
   * ```js
   * // Hide pixels behind an arbitrary, non axis-aligned plane
   *  const plane = new THREE.Plane(new THREE.Vector3(1.5, 20, -19), 20);
   * viewer.setSlicingPlanes([plane]);
   * ```
   * ```js
   * // Disable slicing planes
   *  viewer.setSlicingPlanes([]);
   * ```
   */
  setSlicingPlanes(slicingPlanes: THREE.Plane[]): void {
    const geometryFilterPlanes = this._geometryFilters
      .map(x => new BoundingBoxClipper(x.boundingBox).clippingPlanes)
      .reduce((a, b) => a.concat(b), []);

    const combinedSlicingPlanes = slicingPlanes.concat(geometryFilterPlanes);
    this.renderer.localClippingEnabled = combinedSlicingPlanes.length > 0;
    this._revealManager.clippingPlanes = combinedSlicingPlanes;
    this._slicingNeedsUpdate = true;
  }

  /**
   * @obvious
   * @returns The THREE.Camera used for rendering.
   */
  getCamera(): THREE.Camera {
    return this.camera;
  }

  /**
   * @obvious
   * @returns The THREE.Scene used for rendering.
   */
  getScene(): THREE.Scene {
    return this.scene;
  }

  /**
   * @obvious
   * @returns Camera's position in world space.
   */
  getCameraPosition(): THREE.Vector3 {
    if (this.isDisposed) {
      return new THREE.Vector3(-Infinity, -Infinity, -Infinity);
    }
    return this.controls.getState().position.clone();
  }

  /**
   * @obvious
   * @returns Camera's target in world space.
   */
  getCameraTarget(): THREE.Vector3 {
    if (this.isDisposed) {
      return new THREE.Vector3(-Infinity, -Infinity, -Infinity);
    }
    return this.controls.getState().target.clone();
  }

  /**
   * @obvious
   * @param position Position in world space.
   * @example
   * ```js
   * // store position, target
   * const position = viewer.getCameraPosition();
   * const target = viewer.getCameraTarget();
   * // restore position, target
   * viewer.setCameraPosition(position);
   * viewer.setCameraTarget(target);
   * ```
   */
  setCameraPosition(position: THREE.Vector3): void {
    if (this.isDisposed) {
      return;
    }
    this.controls.setState(position, this.getCameraTarget());
  }

  /**
   * Set camera's target.
   * @public
   * @param target Target in world space.
   * @example
   * ```js
   * // store position, target
   * const position = viewer.getCameraPosition();
   * const target = viewer.getCameraTarget();
   * // restore position, target
   * viewer.setCameraPosition(position);
   * viewer.setCameraTarget(target);
   * ```
   */
  setCameraTarget(target: THREE.Vector3): void {
    if (this.isDisposed) {
      return;
    }
    this.controls.setState(this.getCameraPosition(), target);
  }

  /**
   * Gets wheter camera controls through mouse, touch and keyboard are enabled.
   * @version new in 1.2.0
   */
  get cameraControlsEnabled(): boolean {
    return this.controls.enabled;
  }

  /**
   * Sets wheter camera controls through mouse, touch and keyboard are enabled.
   * This can be useful to e.g. temporarily disable navigation when manipulating other
   * objects in the scene or when implementing a "cinematic" viewer.
   * @version new in 1.2.0
   */
  set cameraControlsEnabled(enabled: boolean) {
    this.controls.enabled = enabled;
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
  loadCameraFromModel(model: CogniteModelBase): void {
    const config = model.getCameraConfiguration();
    if (config) {
      this.controls.setState(config.position, config.target);
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
  fitCameraToModel(model: CogniteModelBase, duration?: number): void {
    const bounds = model.getModelBoundingBox(new THREE.Box3(), true);
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
    const center = new THREE.Vector3().lerpVectors(box.min, box.max, 0.5);
    const radius = 0.5 * new THREE.Vector3().subVectors(box.max, box.min).length();
    const boundingSphere = new THREE.Sphere(center, radius);

    // TODO 2020-03-15 larsmoa: Doesn't currently work :S
    // const boundingSphere = box.getBoundingSphere(new THREE.Sphere());

    const target = boundingSphere.center;
    const distance = boundingSphere.radius * radiusFactor;
    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyQuaternion(this.camera.quaternion);

    const position = new THREE.Vector3();
    position.copy(direction).multiplyScalar(-distance).add(target);

    this.moveCameraTo(position, target, duration);
  }

  /**
   * Typically used when you perform some changes and can't see them unless you move camera.
   * To fix this forceRerender might be used.
   */
  forceRerender(): void {
    this._revealManager.requestRedraw();
  }

  /**
   * Allows to move camera with WASM or arrows keys.
   */
  enableKeyboardNavigation(): void {
    this.controls.enableKeyboardNavigation = true;
  }

  /**
   * Disables camera movement by pressing WASM or arrows keys.
   */
  disableKeyboardNavigation(): void {
    this.controls.enableKeyboardNavigation = false;
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
    this.camera.updateMatrixWorld();
    const p = from3DPositionToRelativeViewportCoordinates(this.camera, point);
    if (p.x < 0 || p.x > 1 || p.y < 0 || p.y > 1 || p.z < 0 || p.z > 1) {
      // Return null if point is outside camera frustum.
      return null;
    }
    if (!normalize) {
      const canvas = this.renderer.domElement;
      p.x = Math.round(p.x * canvas.clientWidth);
      p.y = Math.round(p.y * canvas.clientHeight);
    }
    return new THREE.Vector2(p.x, p.y);
  }

  /**
   * Take screenshot from the current camera position.
   * @param width Width of the final image. Default is current canvas size.
   * @param height Height of the final image. Default is current canvas size.
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
   * document.body.appendChild(url);
   * ```
   */
  async getScreenshot(width = this.canvas.width, height = this.canvas.height): Promise<string> {
    if (this.isDisposed) {
      throw new Error('Viewer is disposed');
    }

    const { width: originalWidth, height: originalHeight } = this.canvas;

    const screenshotCamera = this.camera.clone();
    adjustCamera(screenshotCamera, width, height);

    this.renderer.setSize(width, height);
    this.renderer.render(this.scene, screenshotCamera);
    this._revealManager.render(this.renderer, screenshotCamera, this.scene);
    const url = this.renderer.domElement.toDataURL();

    this.renderer.setSize(originalWidth, originalHeight);
    this.renderer.render(this.scene, this.camera);

    return url;
  }

  /**
   * Raycasting model(s) for finding where the ray intersects with the model.
   * @param offsetX X coordinate in pixels (relative to the domElement).
   * @param offsetY Y coordinate in pixels (relative to the domElement).
   * @param options Options to control the behaviour of the intersection operation. Optional (new in 1.3.0).
   * @returns If there was an intersection then return the intersection object - otherwise it returns `null` if there were no intersections.
   * @see {@link https://en.wikipedia.org/wiki/Ray_casting}.
   
   * @example For CAD model
   * ```js
   * const offsetX = 50 // pixels from the left
   * const offsetY = 100 // pixels from the top
   * const intersection = viewer.getIntersectionFromPixel(offsetX, offsetY);
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
   * const intersection = viewer.getIntersectionFromPixel(offsetX, offsetY);
   * if (intersection) // it was a hit
   *   console.log(
   *   'You hit model ', intersection.model,
   *   ' at the point index ', intersection.pointIndex,
   *   ' at this exact point ', intersection.point
   *   );
   * ```
   * @version The options parameter was added in version 1.3.0
   */
  getIntersectionFromPixel(
    offsetX: number,
    offsetY: number,
    options?: IntersectionFromPixelOptions
  ): null | Intersection {
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
      camera: this.camera,
      renderer: this.renderer,
      domElement: this.renderer.domElement
    };
    const cadResults = intersectCadNodes(cadNodes, input);
    const pointCloudResults = intersectPointClouds(pointCloudNodes, input, options?.pointIntersectionThreshold);

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
            distanceToCamera: result.distance
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
   * @deprecated There is no cache anymore.
   * @throws {@link NotSupportedInMigrationWrapperError}
   */
  clearCache(): void {
    throw new NotSupportedInMigrationWrapperError('Cache is not supported');
  }

  /**
   * Creates a tool for attaching HTML elements to a 3D position and updates it's
   * position/visibility as user moves the camera. This is useful to create HTML
   * overlays to highlight information about key positions in the 3D model.
   *
   * Attached elements *must* have CSS style 'position: absolute'. It's also recommended
   * in most cases to have styles 'pointerEvents: none' and 'touchAction: none' to avoid
   * interfering with 3D navigation. Consider also applying 'transform: translate(-50%, -50%)'
   * to anchor the center of the element rather than the top-left corner. In some cases the
   * `zIndex`-attribute is necessary for the element to appear on top of the viewer.
   *
   * @example
   * ```js
   * const el = document.createElement('div');
   * el.style.position = 'absolute'; // Required!
   * // Anchor to center of element
   * el.style.transform = 'translate(-50%, -50%)';
   * // Avoid being target for events
   * el.style.pointerEvents = 'none;
   * el.style.touchAction = 'none';
   * // Render in front of other elements
   * el.style.zIndex = 10;
   *
   * el.style.color = 'red';
   * el.innerHtml = '<h1>Overlay</h1>';
   *
   * const overlayTool = viewer.createHtmlOverlays();
   * overlayTool.attachHtmlElement(el, new THREE.Vector3(10, 10, 10));
   * // ...
   * overlayTool.removeHtmlElement(el);
   * // or, to remove all attached elements:
   * overlayTool.dispose();
   * ```
   */
  createHtmlOverlayTool(): HtmlOverlayTool {
    const overlays = new HtmlOverlayTool(this.domElement, this.renderer, this.camera);
    this.registerTool(overlays);
    return overlays;
  }

  /**
   * Registers a new tool. This makes the tool get updates from the viewer.
   * The tool will be unregistered when it's diposed.
   * @param tool Tool to register.
   */
  private registerTool(tool: Cognite3DViewerTool): void {
    if (this._tools.has(tool)) {
      throw new Error(`Tool ${tool} is already registered`);
    }
    const onDisposed: DisposedDelegate = () => this.unregisterTool(tool);
    this._tools.set(tool, onDisposed);
    tool.on('disposed', onDisposed);
  }

  /**
   * Unregisters a previously registered tool for updates. Note! Tools
   * are automatically unregistered when they are disposed so you will
   * probably not need to call this function.
   * @param tool A previously registered tool.
   */
  private unregisterTool(tool: Cognite3DViewerTool): void {
    const onDisposed = this._tools.get(tool);
    if (onDisposed === undefined) {
      throw new Error(`Tool ${tool} is not registered`);
    }
    tool.off('disposed', onDisposed);
    this._tools.delete(tool);
  }

  /**
   * Notifies all registered tools that there has been rendered a frame.
   */
  private notifyToolsAboutRendering() {
    for (const tool of this._tools.keys()) {
      tool.notifyRendered();
    }
  }

  private getModels(type: 'cad'): Cognite3DModel[];
  private getModels(type: 'pointcloud'): CognitePointCloudModel[];
  /** @private */
  private getModels(type: SupportedModelTypes): CogniteModelBase[] {
    return this.models.filter(x => x.type === type);
  }

  /** @private */
  private moveCameraTo(position: THREE.Vector3, target: THREE.Vector3, duration?: number) {
    if (this.isDisposed) {
      return;
    }

    const { camera } = this;

    if (duration == null) {
      const distance = position.distanceTo(camera.position);
      duration = distance * 125; // 250ms per unit distance
      duration = Math.min(Math.max(duration, 600), 2500); // min duration 600ms and 2500ms as max duration
    }

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    const distanceToTarget = target.distanceTo(camera.position);
    const scaledDirection = raycaster.ray.direction.clone().multiplyScalar(distanceToTarget);
    const startTarget = raycaster.ray.origin.clone().add(scaledDirection);
    const from = {
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z,
      targetX: startTarget.x,
      targetY: startTarget.y,
      targetZ: startTarget.z
    };
    const to = {
      x: position.x,
      y: position.y,
      z: position.z,
      targetX: target.x,
      targetY: target.y,
      targetZ: target.z
    };

    const animation = new TWEEN.Tween(from);
    const stopTween = (event: Event) => {
      if (this.isDisposed) {
        document.removeEventListener('keydown', stopTween);
        animation.stop();
        return;
      }

      if (event.type !== 'keydown' || this.controls.enableKeyboardNavigation) {
        animation.stop();
        this.canvas.removeEventListener('pointerdown', stopTween);
        this.canvas.removeEventListener('wheel', stopTween);
        document.removeEventListener('keydown', stopTween);
      }
    };

    this.canvas.addEventListener('pointerdown', stopTween);
    this.canvas.addEventListener('wheel', stopTween);
    document.addEventListener('keydown', stopTween);

    const tmpTarget = new THREE.Vector3();
    const tmpPosition = new THREE.Vector3();
    const tween = animation
      .to(to, duration)
      .easing((x: number) => TWEEN.Easing.Circular.Out(x))
      .onUpdate(() => {
        if (this.isDisposed) {
          return;
        }
        tmpPosition.set(from.x, from.y, from.z);
        tmpTarget.set(from.targetX, from.targetY, from.targetZ);
        if (!this.camera) {
          return;
        }

        this.setCameraPosition(tmpPosition);
        this.setCameraTarget(tmpTarget);
      })
      .onComplete(() => {
        if (this.isDisposed) {
          return;
        }
        this.canvas.removeEventListener('pointerdown', stopTween);
      })
      .start(TWEEN.now());
    tween.update(TWEEN.now());
  }

  /** @private */
  private async animate(time: number) {
    if (this.isDisposed) {
      return;
    }
    this.latestRequestId = requestAnimationFrame(this.animate.bind(this));

    const { display, visibility } = window.getComputedStyle(this.canvas);
    const isVisible = visibility === 'visible' && display !== 'none';

    if (isVisible) {
      const { renderController } = this;
      TWEEN.update(time);
      const didResize = this.resizeIfNecessary();
      if (didResize) {
        renderController.redraw();
      }
      this.controls.update(this.clock.getDelta());
      renderController.update();
      this._revealManager.update(this.camera);

      if (renderController.needsRedraw || this._revealManager.needsRedraw || this._slicingNeedsUpdate) {
        const frameNumber = this.renderer.info.render.frame;
        const start = Date.now();
        this.triggerUpdateCameraNearAndFar();
        this._revealManager.render(this.renderer, this.camera, this.scene);
        renderController.clearNeedsRedraw();
        this._revealManager.resetRedraw();
        this._slicingNeedsUpdate = false;
        const renderTime = Date.now() - start;

        this.eventListeners.sceneRendered.forEach(listener => {
          listener({ frameNumber, renderTime, renderer: this.renderer, camera: this.camera });
        });
        this.notifyToolsAboutRendering();
      }
    }
  }

  /** @private */
  private setupUpdateCameraNearAndFar(): Subject<{ camera: THREE.PerspectiveCamera; force: boolean }> {
    const lastUpdatePosition = new THREE.Vector3(Infinity, Infinity, Infinity);
    const camPosition = new THREE.Vector3();

    const updateNearFarSubject = new Subject<{ camera: THREE.PerspectiveCamera; force: boolean }>();
    updateNearFarSubject
      .pipe(
        map(state => {
          if (state.force) {
            // Emulate camera movement to force update
            return Infinity;
          }
          return lastUpdatePosition.distanceToSquared(state.camera.getWorldPosition(camPosition));
        }),
        (source: Observable<number>) => {
          return merge(
            // When camera is moved more than 10 meters
            source.pipe(filter(distanceMoved => distanceMoved > 10.0)),
            // Or it's been a while since we last update near/far and camera has moved slightly
            source.pipe(
              debounceTime(100),
              filter(distanceMoved => distanceMoved > 0.0)
            )
          );
        }
      )
      .subscribe(() => {
        this.camera.getWorldPosition(lastUpdatePosition);
        this.updateCameraNearAndFar(this.camera);
      });
    return updateNearFarSubject;
  }

  /** @private */
  private triggerUpdateCameraNearAndFar(force?: boolean) {
    this._updateCameraNearAndFarSubject.next({ camera: this.camera, force: !!force });
  }

  /** @private */
  private updateCameraNearAndFar(camera: THREE.PerspectiveCamera) {
    // See https://stackoverflow.com/questions/8101119/how-do-i-methodically-choose-the-near-clip-plane-distance-for-a-perspective-proj
    if (this.isDisposed) {
      return;
    }
    const {
      combinedBbox,
      bbox,
      cameraPosition,
      cameraDirection,
      corners,
      nearPlane,
      nearPlaneCoplanarPoint
    } = this._updateNearAndFarPlaneBuffers;
    // 1. Compute the bounds of all geometry
    combinedBbox.makeEmpty();
    this.models.forEach(model => {
      model.getModelBoundingBox(bbox);
      combinedBbox.expandByPoint(bbox.min);
      combinedBbox.expandByPoint(bbox.max);
    });
    this.extraObjects.forEach(obj => {
      bbox.setFromObject(obj);
      combinedBbox.expandByPoint(bbox.min);
      combinedBbox.expandByPoint(bbox.max);
    });
    getBoundingBoxCorners(combinedBbox, corners);
    camera.getWorldPosition(cameraPosition);
    camera.getWorldDirection(cameraDirection);

    // 1. Compute nearest to fit the whole bbox (the case
    // where the camera is inside the box for now is ignored for now)
    let near = combinedBbox.distanceToPoint(cameraPosition);
    near /= Math.sqrt(1 + Math.tan(((camera.fov / 180) * Math.PI) / 2) ** 2 * (camera.aspect ** 2 + 1));
    near = Math.max(0.1, near);

    // 2. Compute the far distance to the distance from camera to furthest
    // corner of the boundingbox that is "in front" of the near plane
    nearPlaneCoplanarPoint.copy(cameraPosition).addScaledVector(cameraDirection, near);
    nearPlane.setFromNormalAndCoplanarPoint(cameraDirection, nearPlaneCoplanarPoint);
    let far = -Infinity;
    for (let i = 0; i < 8; ++i) {
      if (nearPlane.distanceToPoint(corners[i]) >= 0) {
        const dist = corners[i].distanceTo(cameraPosition);
        far = Math.max(far, dist);
      }
    }
    far = Math.max(near * 2, far);

    // 3. Handle when camera is inside the model by adjusting the near value
    const diagonal = combinedBbox.min.distanceTo(combinedBbox.max);
    if (combinedBbox.containsPoint(cameraPosition)) {
      near = Math.min(0.1, far / 1000.0);
    }

    // Apply
    camera.near = near;
    camera.far = far;
    camera.updateProjectionMatrix();
    // The minDistance of the camera controller determines at which distance
    // we will push the target in front of us instead of getting closer to it.
    // This is also used to determine the speed of the camera when flying with ASDW.
    // We want to either let it be controlled by the near plane if we are far away,
    // but no more than a fraction of the bounding box of the system if inside
    this.controls.minDistance = Math.min(Math.max(diagonal * 0.02, 0.1 * near), 10.0);
  }

  /** @private */
  private resizeIfNecessary(): boolean {
    if (this.isDisposed) {
      return false;
    }
    // The maxTextureSize is chosen from testing on low-powered hardware,
    // and could be increased in the future.
    // TODO Increase maxTextureSize if SSAO performance is improved
    const maxTextureSize = 1.4e6;

    const rendererSize = this.renderer.getSize(new THREE.Vector2());
    const rendererPixelWidth = rendererSize.width;
    const rendererPixelHeight = rendererSize.height;

    // client width and height are in virtual pixels and not yet scaled by dpr
    // TODO VERSION 5.0.0 remove the test for dom element size once we have removed the getCanvas function
    const clientWidth = this.domElement.clientWidth !== 0 ? this.domElement.clientWidth : this.canvas.clientWidth;
    const clientHeight = this.domElement.clientHeight !== 0 ? this.domElement.clientHeight : this.canvas.clientHeight;
    const clientPixelWidth = this.renderer.getPixelRatio() * clientWidth;
    const clientPixelHeight = this.renderer.getPixelRatio() * clientHeight;
    const clientTextureSize = clientPixelWidth * clientPixelHeight;

    const scale = clientTextureSize > maxTextureSize ? Math.sqrt(maxTextureSize / clientTextureSize) : 1;

    const width = clientPixelWidth * scale;
    const height = clientPixelHeight * scale;

    const maxError = 0.1; // pixels
    const isOptimalSize =
      Math.abs(rendererPixelWidth - width) < maxError && Math.abs(rendererPixelHeight - height) < maxError;

    if (isOptimalSize) {
      return false;
    }

    this.renderer.setSize(width, height);

    adjustCamera(this.camera, width, height);

    // fixme: Invalid instanceof check: 'camera' has type that is not related to 'OrthographicCamera'
    if (this.camera instanceof THREE.OrthographicCamera) {
      this.controls.orthographicCameraDollyFactor = 20 / width;
      this.controls.keyboardDollySpeed = 2 / width;
    }

    return true;
  }

  private startPointerEventListeners = () => {
    const canvas = this.canvas;
    const maxMoveDistance = 4;
    const maxClickDuration = 250;

    let pointerDown = false;
    let pointerDownTimestamp = 0;
    let validClick = false;

    const onHoverCallback = debounce((e: MouseEvent) => {
      this.eventListeners.hover.forEach(fn => fn(clickOrTouchEventOffset(e, canvas)));
    }, 100);

    const onMove = (e: MouseEvent | TouchEvent) => {
      const { offsetX, offsetY } = clickOrTouchEventOffset(e, canvas);
      const { offsetX: firstOffsetX, offsetY: firstOffsetY } = clickOrTouchEventOffset(e, canvas);

      // check for Manhattan distance greater than maxMoveDistance pixels
      if (
        pointerDown &&
        validClick &&
        Math.abs(offsetX - firstOffsetX) + Math.abs(offsetY - firstOffsetY) > maxMoveDistance
      ) {
        validClick = false;
      }
    };

    const onUp = (e: MouseEvent | TouchEvent) => {
      const clickDuration = e.timeStamp - pointerDownTimestamp;
      if (pointerDown && validClick && clickDuration < maxClickDuration) {
        // trigger events
        this.eventListeners.click.forEach(func => {
          func(clickOrTouchEventOffset(e, canvas));
        });
      }
      pointerDown = false;
      validClick = false;

      // move
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('touchmove', onMove);

      // up
      canvas.removeEventListener('mouseup', onUp);
      canvas.removeEventListener('touchend', onUp);

      // add back onHover
      canvas.addEventListener('mousemove', onHoverCallback);
    };

    const onDown = (e: MouseEvent | TouchEvent) => {
      event = e;
      pointerDown = true;
      validClick = true;
      pointerDownTimestamp = e.timeStamp;

      // move
      canvas.addEventListener('mousemove', onMove);
      canvas.addEventListener('touchmove', onMove);

      // up
      canvas.addEventListener('mouseup', onUp);
      canvas.addEventListener('touchend', onUp);

      // no more onHover
      canvas.removeEventListener('mousemove', onHoverCallback);
    };

    // down
    canvas.addEventListener('mousedown', onDown);
    canvas.addEventListener('touchstart', onDown);

    // on hover callback
    canvas.addEventListener('mousemove', onHoverCallback);
  };
}

function adjustCamera(camera: THREE.Camera, width: number, height: number) {
  if (camera instanceof THREE.PerspectiveCamera) {
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  } else if (camera instanceof THREE.OrthographicCamera) {
    camera.left = -width;
    camera.right = width;
    camera.top = height;
    camera.bottom = -height;
  }
}

function createCanvasWrapper(): HTMLElement {
  const domElement = document.createElementNS('http://www.w3.org/1999/xhtml', 'div');
  domElement.style.width = '100%';
  domElement.style.height = '100%';
  return domElement;
}

function getBoundingBoxCorners(bbox: THREE.Box3, outBuffer?: THREE.Vector3[]): THREE.Vector3[] {
  outBuffer = outBuffer || [
    new THREE.Vector3(),
    new THREE.Vector3(),
    new THREE.Vector3(),
    new THREE.Vector3(),
    new THREE.Vector3(),
    new THREE.Vector3(),
    new THREE.Vector3(),
    new THREE.Vector3()
  ];
  if (outBuffer.length !== 8) {
    throw new Error(`outBuffer must hold exactly 8 elements, but holds ${outBuffer.length} elemnents`);
  }

  const min = bbox.min;
  const max = bbox.max;
  outBuffer[0].set(min.x, min.y, min.z);
  outBuffer[1].set(max.x, min.y, min.z);
  outBuffer[2].set(min.x, max.y, min.z);
  outBuffer[3].set(min.x, min.y, max.z);
  outBuffer[4].set(max.x, max.y, min.z);
  outBuffer[5].set(max.x, max.y, max.z);
  outBuffer[6].set(max.x, min.y, max.z);
  outBuffer[7].set(min.x, max.y, max.z);
  return outBuffer;
}

function createRevealManagerOptions(viewerOptions: Cognite3DViewerOptions): RevealOptions {
  const revealOptions: RevealOptions = { internal: {} };
  revealOptions.internal = { sectorCuller: viewerOptions._sectorCuller };
  const { antiAliasing, multiSampleCount } = determineAntiAliasingMode(viewerOptions.antiAliasingHint);

  revealOptions.renderOptions = {
    antiAliasing,
    multiSampleCountHint: multiSampleCount
  };
  return revealOptions;
}

function determineAntiAliasingMode(
  mode: PropType<Cognite3DViewerOptions, 'antiAliasingHint'>
): { antiAliasing: AntiAliasingMode; multiSampleCount: number } {
  mode = mode || 'fxaa';

  switch (mode) {
    case 'disabled':
      return { antiAliasing: AntiAliasingMode.NoAA, multiSampleCount: 1 };
    case 'fxaa':
      return { antiAliasing: AntiAliasingMode.FXAA, multiSampleCount: 1 };
    case 'msaa2':
      return { antiAliasing: AntiAliasingMode.NoAA, multiSampleCount: 2 };
    case 'msaa4':
      return { antiAliasing: AntiAliasingMode.NoAA, multiSampleCount: 4 };
    case 'msaa8':
      return { antiAliasing: AntiAliasingMode.NoAA, multiSampleCount: 8 };
    case 'msaa16':
      return { antiAliasing: AntiAliasingMode.NoAA, multiSampleCount: 16 };
    case 'msaa2+fxaa':
      return { antiAliasing: AntiAliasingMode.FXAA, multiSampleCount: 2 };
    case 'msaa4+fxaa':
      return { antiAliasing: AntiAliasingMode.FXAA, multiSampleCount: 4 };
    case 'msaa8+fxaa':
      return { antiAliasing: AntiAliasingMode.FXAA, multiSampleCount: 8 };
    case 'msaa16+fxaa':
      return { antiAliasing: AntiAliasingMode.FXAA, multiSampleCount: 16 };
    default:
      // Ensures there is a compile error if a case is missing
      assertNever(mode, `Unsupported anti-aliasing mode: ${mode}`);
  }
}
