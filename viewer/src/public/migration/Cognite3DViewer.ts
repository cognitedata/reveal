/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';
import debounce from 'lodash/debounce';
import omit from 'lodash/omit';
import ComboControls from '@cognite/three-combo-controls';
import { CogniteClient } from '@cognite/sdk';
import { debounceTime, filter, map, publish } from 'rxjs/operators';
import { merge, Subject, Subscription, fromEventPattern } from 'rxjs';

import { from3DPositionToRelativeViewportCoordinates } from '@/utilities/worldToViewport';
import { intersectCadNodes } from '@/datamodels/cad/picking';

import { AddModelOptions, Cognite3DViewerOptions, GeometryFilter, SupportedModelTypes } from './types';
import { NotSupportedInMigrationWrapperError } from './NotSupportedInMigrationWrapperError';
import { Intersection } from './intersection';
import RenderController from './RenderController';
import { CogniteModelBase } from './CogniteModelBase';

import { CdfModelDataClient } from '@/utilities/networking/CdfModelDataClient';
import { Cognite3DModel } from './Cognite3DModel';
import { CognitePointCloudModel } from './CognitePointCloudModel';
import { BoundingBoxClipper, File3dFormat, isMobileOrTablet } from '@/utilities';
import { Spinner } from '@/utilities/Spinner';
import { trackError, initMetrics, trackLoadModel } from '@/utilities/metrics';
import { RevealManager } from '../RevealManager';
import { createCdfRevealManager } from '../createRevealManager';
import { CdfModelIdentifier } from '@/utilities/networking/types';
import { RevealOptions, SectorNodeIdToTreeIndexMapLoadedEvent } from '../types';

export type PointerEventDelegate = (event: { offsetX: number; offsetY: number }) => void;
export type CameraChangeDelegate = (position: THREE.Vector3, target: THREE.Vector3) => void;

/**
 * @example
 * ```js
 * const viewer = new Cognite3DViewer({
 *   noBackground: true,
 *   sdk: CogniteClient({...})
 * });
 * ```
 */
export class Cognite3DViewer {
  private get canvas(): HTMLCanvasElement {
    return this.renderer.domElement;
  }

  /**
   * For now it just always returns true.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext#Browser_compatibility
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
  private readonly _updateCameraNearAndFarSubject: Subject<THREE.PerspectiveCamera>;
  private readonly _subscription = new Subscription();
  private readonly _revealManager: RevealManager<CdfModelIdentifier>;

  private readonly eventListeners = {
    cameraChange: new Array<CameraChangeDelegate>(),
    click: new Array<PointerEventDelegate>(),
    hover: new Array<PointerEventDelegate>()
  };
  private readonly models: CogniteModelBase[] = [];
  private readonly extraObjects: THREE.Object3D[] = [];

  private isDisposed = false;
  private forceRendering = false; // For future support

  private readonly renderController: RenderController;
  private latestRequestId: number = -1;
  private readonly clock = new THREE.Clock();
  private _slicingNeedsUpdate: boolean = false;
  private _geometryFilters: GeometryFilter[] = [];

  private readonly spinner: Spinner;

  /**
   * Reusable buffers used by functions in Cognite3dViewer to avoid allocations
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

  constructor(options: Cognite3DViewerOptions) {
    if (options.enableCache) {
      throw new NotSupportedInMigrationWrapperError('Cache is not supported');
    }
    if (options.viewCube) {
      throw new NotSupportedInMigrationWrapperError('ViewCube is not supported');
    }

    initMetrics(options.logMetrics !== false, options.sdk.project, {
      moduleName: 'Cognite3DViewer',
      methodName: 'constructor',
      constructorOptions: omit(options, ['sdk', 'domElement', 'renderer', '_sectorCuller'])
    });

    this.renderer =
      options.renderer ||
      new THREE.WebGLRenderer({
        antialias: shouldEnableAntialiasing()
      });
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

    const revealOptions: RevealOptions = { internal: {} };
    revealOptions.internal = { sectorCuller: options._sectorCuller };

    this._revealManager = createCdfRevealManager(this.sdkClient, revealOptions);

    this.startPointerEventListeners();

    this._subscription.add(
      fromEventPattern(
        h => this._revealManager.on('loadingStateChanged', h),
        h => this._revealManager.off('loadingStateChanged', h)
      ).subscribe(
        isLoading => {
          if (isLoading) {
            this.spinner.show();
          } else {
            this.spinner.hide();
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
  }

  /**
   * Returns reveal version installed
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
   * ```
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
    this.scene.dispose();
    for (const model of this.models.values()) {
      model.dispose();
    }
    this.models.splice(0);
    this.spinner.dispose();
  }

  /**
   * Add event listener to the viewer.
   * Call {@link Cognite3DViewer.off} to remove an event listener
   * @example
   * ```js
   * const onClick = (event) => { console.log(event.offsetX, event.offsetY) };
   * viewer.on('click', onClick);
   * ```
   */
  on(event: 'click' | 'hover', callback: PointerEventDelegate): void;
  /**
   * Add event listener to the viewer.
   * Call {@link Cognite3DViewer.off} to remove an event listener
   * @example
   * ```js
   * viewer.on('cameraChange', (position, target) => {
   *   console.log('Camera changed: ', position, target);
   * });
   * ```
   */
  on(event: 'cameraChange', callback: CameraChangeDelegate): void;
  on(event: 'click' | 'hover' | 'cameraChange', callback: PointerEventDelegate | CameraChangeDelegate): void {
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

      default:
        throw new Error(`Unsupported event "${event}"`);
    }
  }

  off(event: 'click' | 'hover', callback: PointerEventDelegate): void;
  off(event: 'cameraChange', callback: CameraChangeDelegate): void;
  /**
   * Remove event listener from the viewer
   * Call {@link Cognite3DViewer.on} to add event listener
   * @example
   * ```js
   * viewer.off('click', onClick);
   * ```
   */
  off(event: 'click' | 'hover' | 'cameraChange', callback: any): void {
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

      default:
        throw new Error(`Unsupported event "${event}"`);
    }
  }

  /**
   * Add a new model to the viewer.
   * Call {@link Cognite3DViewer.fitCameraToModel} to see the model after the model has loaded
   * @example
   * ```js
   * const options = {
   *   modelId:     'COGNITE_3D_MODEL_ID',
   *   revisionId:  'COGNITE_3D_REVISION_ID',
   * };
   * viewer.addModel(options).then(model => {
   *   viewer.fitCameraToModel(model, 0);
   * });
   * ```
   */
  async addModel(options: AddModelOptions): Promise<Cognite3DModel | CognitePointCloudModel> {
    const type = await this.determineModelType(options.modelId, options.revisionId);
    switch (type) {
      case SupportedModelTypes.CAD:
        return this.addCadModel(options);
      case SupportedModelTypes.PointCloud:
        return this.addPointCloudModel(options);
      default:
        throw new Error('Model is not supported');
    }
  }

  /**
   * Add a new CAD 3D model to the viewer.
   * Call {@link Cognite3DViewer.fitCameraToModel} to see the model after the model has loaded
   * @example
   * ```js
   * const options = {
   *   modelId:     'COGNITE_3D_MODEL_ID',
   *   revisionId:  'COGNITE_3D_REVISION_ID',
   * };
   * viewer.addCadModel(options).then(model => {
   *   viewer.fitCameraToModel(model, 0);
   * });
   * ```
   */
  async addCadModel(options: AddModelOptions): Promise<Cognite3DModel> {
    trackLoadModel(
      {
        options: omit(options, ['modelId', 'revisionId']),
        type: SupportedModelTypes.CAD,
        moduleName: 'Cognite3DViewer',
        methodName: 'addCadModel'
      },
      {
        modelId: options.modelId,
        revisionId: options.revisionId
      }
    );

    if (options.localPath) {
      throw new NotSupportedInMigrationWrapperError();
    }
    if (options.onComplete) {
      throw new NotSupportedInMigrationWrapperError();
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
   * Call {@link Cognite3DViewer.fitCameraToModel} to see the model after the model has loaded
   * @example
   * ```js
   * const options = {
   *   modelId:     'COGNITE_3D_MODEL_ID',
   *   revisionId:  'COGNITE_3D_REVISION_ID',
   * };
   * viewer.addPointCloudModel(options).then(model => {
   *   viewer.fitCameraToModel(model, 0);
   * });
   * ```
   */
  async addPointCloudModel(options: AddModelOptions): Promise<CognitePointCloudModel> {
    trackLoadModel(
      {
        options: omit(options, ['modelId', 'revisionId']),
        type: SupportedModelTypes.PointCloud,
        moduleName: 'Cognite3DViewer',
        methodName: 'addPointCloudModel'
      },
      {
        modelId: options.modelId,
        revisionId: options.revisionId
      }
    );

    if (options.localPath) {
      throw new NotSupportedInMigrationWrapperError();
    }
    if (options.geometryFilter) {
      throw new NotSupportedInMigrationWrapperError();
    }
    if (options.orthographicCamera) {
      throw new NotSupportedInMigrationWrapperError();
    }
    if (options.onComplete) {
      throw new NotSupportedInMigrationWrapperError();
    }

    const { modelId, revisionId } = options;
    const [potreeGroup, potreeNode] = await this._revealManager.addModel('pointcloud', {
      modelId,
      revisionId
    });
    const model = new CognitePointCloudModel(modelId, revisionId, potreeGroup, potreeNode);
    this.models.push(model);
    this.scene.add(model);
    return model;
  }

  /**
   * Use to determine of which type the model is.
   *
   * @param modelId the model's id
   * @param revisionId the model's revision id
   *
   * @example
   * ```typescript
   * const viewer = new Cognite3DViewer(...);
   * const type = await viewer.determineModelType(options.modelId, options.revisionId)
   * let model: Cognite3DModel | CognitePointCloudModel
   * switch (type) {
   *   case SupportedModelTypes.CAD:
   *     model = await viewer.addCadModel(options);
   *     break;
   *   case SupportedModelTypes.PointCloud:
   *     model = await viewer.addPointCloudModel(options);
   *     break;
   *   default:
   *     throw new Error('Model is not supported');
   * }
   * viewer.fitCameraToModel(model);
   * ```
   */
  async determineModelType(modelId: number, revisionId: number): Promise<SupportedModelTypes> {
    const clientExt = new CdfModelDataClient(this.sdkClient);
    const outputs = await clientExt.getOutputs({ modelId, revisionId, format: File3dFormat.AnyFormat });
    if (outputs.findMostRecentOutput(File3dFormat.RevealCadModel) !== undefined) {
      return SupportedModelTypes.CAD;
    } else if (outputs.findMostRecentOutput(File3dFormat.EptPointCloud) !== undefined) {
      return SupportedModelTypes.PointCloud;
    }
    return SupportedModelTypes.NotSupported;
  }

  /**
   * Add a THREE.Object3D to the viewer
   * @example
   * ```js
   * const sphere = new THREE.Mesh(
   *   new THREE.SphereBufferGeometry(),
   *   new THREE.MeshBasicMaterial()
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
  }

  /**
   * Remove a THREE.Object3D from the viewer
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
  }

  /**
   * Sets the color used as the clear color of the renderer.
   */
  setBackgroundColor(color: THREE.Color) {
    if (this.isDisposed) {
      return;
    }

    this.renderer.setClearColor(color);
  }

  /**
   * Sets per-pixel slicing planes. Pixels behind any of the planes will be sliced away.
   * @param slicingPlanes The planes to use for slicing
   * @examples
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
   * @returns the THREE.Camera used for rendering.
   */
  getCamera(): THREE.Camera {
    return this.camera;
  }

  /**
   * @returns the THREE.Scene used for rendering.
   */
  getScene(): THREE.Scene {
    return this.scene;
  }

  /**
   * @returns camera's position in world space
   */
  getCameraPosition(): THREE.Vector3 {
    if (this.isDisposed) {
      return new THREE.Vector3(-Infinity, -Infinity, -Infinity);
    }
    return this.controls.getState().position.clone();
  }

  /**
   * @returns camera's target in world space
   */
  getCameraTarget(): THREE.Vector3 {
    if (this.isDisposed) {
      return new THREE.Vector3(-Infinity, -Infinity, -Infinity);
    }
    return this.controls.getState().target.clone();
  }

  /**
   * @param position Position in world space
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
   * Set camera's target
   * @public
   * @param target Target in world space
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
   * Move camera to a place where the 3D model is visible.
   * It uses the bounding box of the 3D model and calls {@link Cognite3DViewer.fitCameraToBoundingBox}
   * @param model The 3D model
   * @param duration The duration of the animation moving the camera. Set this to 0 (zero) to disable animation.
   * @examples
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
    const bounds = model.getModelBoundingBox();
    this.fitCameraToBoundingBox(bounds, duration);
  }

  /**
   * Move camera to a place where the content of a bounding box is visible to the camera.
   * @param box The bounding box in world space
   * @param duration The duration of the animation moving the camera. Set this to 0 (zero) to disable animation.
   * @param radiusFactor The ratio of the distance from camera to center of box and radius of the box
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
   * @see {@link https://www.w3schools.com/graphics/canvas_coordinates.asp https://www.w3schools.com/graphics/canvas_coordinates.asp}
   * @param point World space coordinate.
   * @param normalize Optional. If true, coordinates are normalized into [0,1]. If false, the values are in the range [0, <canvas_size>).
   * @return Returns 2D coordinates if the point is visible on screen, or `null` if object is outside screen.
   * @examples
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
   * @returns A {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs Data URL} of the image ('image/png')
   * @examples
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
   * @param offsetX X coordinate in pixels (relative to the domElement)
   * @param offsetY Y coordinate in pixels (relative to the domElement)
   * @returns If there was an intersection then return the intersection object - otherwise it returns `null` if there were no intersections.
   * @see {@link https://en.wikipedia.org/wiki/Ray_casting}
   * @example
   * ```js
   * const offsetX = 50 // pixels from the left
   * const offsetY = 100 // pixels from the top
   * const intersection = viewer.getIntersectionFromPixel(offsetX, offsetY);
   * if (intersection) // it was a hit
   *   console.log(
   *     'You hit model ', intersection.model,
   *     ' at the node with id ', intersection.nodeId,
   *     ' at this exact point ', intersection.point
   *   );
   * ```
   */
  getIntersectionFromPixel(offsetX: number, offsetY: number): null | Intersection {
    const cadModels = this.getModels(SupportedModelTypes.CAD);
    const nodes = cadModels.map(x => x.cadNode);

    const coords = {
      x: (offsetX / this.renderer.domElement.clientWidth) * 2 - 1,
      y: (offsetY / this.renderer.domElement.clientHeight) * -2 + 1
    };
    const results = intersectCadNodes(nodes, {
      coords,
      camera: this.camera,
      renderer: this.renderer
    });

    if (results.length > 0) {
      const result = results[0]; // Nearest intersection
      for (const model of cadModels) {
        if (model.cadNode === result.cadNode) {
          const intersection: Intersection = {
            model,
            nodeId: model.tryGetNodeId(result.treeIndex) || -1,
            treeIndex: result.treeIndex,
            point: result.point
          };
          return intersection;
        }
      }
    }

    return null;
  }

  /**
   * @deprecated There is no cache anymore.
   * @throws {@link NotSupportedInMigrationWrapperError}
   */
  clearCache(): void {
    throw new NotSupportedInMigrationWrapperError('Cache is not supported');
  }

  private getModels(type: SupportedModelTypes.CAD): Cognite3DModel[];
  private getModels(type: SupportedModelTypes.PointCloud): CognitePointCloudModel[];
  private getModels(type: SupportedModelTypes): CogniteModelBase[] {
    return this.models.filter(x => x.type === type);
  }

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
    animation
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
      .start(0);
  }

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

      if (
        renderController.needsRedraw ||
        this.forceRendering ||
        this._revealManager.needsRedraw ||
        this._slicingNeedsUpdate
      ) {
        this.triggerUpdateCameraNearAndFar();
        this._revealManager.render(this.renderer, this.camera, this.scene);
        renderController.clearNeedsRedraw();
        this._revealManager.resetRedraw();
        this._slicingNeedsUpdate = false;
      }
    }
  }

  private setupUpdateCameraNearAndFar(): Subject<THREE.PerspectiveCamera> {
    const lastUpdatePosition = new THREE.Vector3(Infinity, Infinity, Infinity);
    const camPosition = new THREE.Vector3();

    const updateNearFarSubject = new Subject<THREE.PerspectiveCamera>();
    updateNearFarSubject
      .pipe(
        map(cam => lastUpdatePosition.distanceToSquared(cam.getWorldPosition(camPosition))),
        publish(observable => {
          return merge(
            // When camera is moved more than 10 meters
            observable.pipe(filter(distanceMoved => distanceMoved > 10.0)),
            // Or it's been a while since we last update near/far and camera has moved slightly
            observable.pipe(
              debounceTime(250),
              filter(distanceMoved => distanceMoved > 0.0)
            )
          );
        })
      )
      .subscribe(() => {
        this.camera.getWorldPosition(lastUpdatePosition);
        this.updateCameraNearAndFar(this.camera);
      });
    return updateNearFarSubject;
  }

  private triggerUpdateCameraNearAndFar() {
    this._updateCameraNearAndFarSubject.next(this.camera);
  }

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
    this.controls.minDistance = Math.max(diagonal * 0.02, 0.1 * near);
  }

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
    const clientPixelWidth = window.devicePixelRatio * clientWidth;
    const clientPixelHeight = window.devicePixelRatio * clientHeight;
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

    if (this.camera instanceof THREE.OrthographicCamera) {
      this.controls.orthographicCameraDollyFactor = 20 / width;
      this.controls.keyboardDollySpeed = 2 / width;
    }

    return true;
  }

  private startPointerEventListeners = () => {
    const canvas = this.canvas;
    const maxMoveDistance = 4;

    let pointerDown = false;
    let validClick = false;

    const onHoverCallback = debounce((e: MouseEvent) => {
      this.eventListeners.hover.forEach(fn => fn(mouseEventOffset(e, canvas)));
    }, 100);

    const onMove = (e: MouseEvent | TouchEvent) => {
      const { offsetX, offsetY } = mouseEventOffset(e, canvas);
      const { offsetX: firstOffsetX, offsetY: firstOffsetY } = mouseEventOffset(e, canvas);

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
      if (pointerDown && validClick) {
        // trigger events
        this.eventListeners.click.forEach(func => {
          func(mouseEventOffset(e, canvas));
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

function shouldEnableAntialiasing(): boolean {
  return !isMobileOrTablet();
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

function mouseEventOffset(ev: MouseEvent | TouchEvent, target: HTMLElement) {
  target = target || ev.currentTarget || ev.srcElement;
  const cx = 'clientX' in ev ? ev.clientX : 0;
  const cy = 'clientY' in ev ? ev.clientY : 0;
  const rect = target.getBoundingClientRect();
  return {
    offsetX: cx - rect.left,
    offsetY: cy - rect.top
  };
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
