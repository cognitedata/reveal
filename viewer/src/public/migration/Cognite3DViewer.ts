/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';
import debounce from 'lodash/debounce';
import ComboControls from '@cognite/three-combo-controls';
import { CogniteClient, IdEither } from '@cognite/sdk';
import { distinctUntilChanged, filter, share, debounceTime, publish, map } from 'rxjs/operators';
import { Subscription, Subject, combineLatest, merge } from 'rxjs';

import { from3DPositionToRelativeViewportCoordinates } from '@/utilities/worldToViewport';
import { CadSectorParser } from '@/datamodels/cad/sector/CadSectorParser';
import { SimpleAndDetailedToSector3D } from '@/datamodels/cad/sector/SimpleAndDetailedToSector3D';
import { CachedRepository } from '@/datamodels/cad/sector/CachedRepository';
import { MaterialManager } from '@/datamodels/cad/MaterialManager';
import { intersectCadNodes } from '@/datamodels/cad/picking';

import { AddModelOptions, Cognite3DViewerOptions, GeometryFilter, SupportedModelTypes } from './types';
import { NotSupportedInMigrationWrapperError } from './NotSupportedInMigrationWrapperError';
import { Intersection } from './intersection';
import RenderController from './RenderController';
import { CogniteModelBase } from './CogniteModelBase';

import { CogniteClient3dExtensions } from '@/utilities/networking/CogniteClient3dExtensions';
import { RevealManagerBase } from '@/public/RevealManagerBase';
import { Cognite3DModel } from './Cognite3DModel';
import { CognitePointCloudModel } from './CognitePointCloudModel';
import { CadManager } from '@/datamodels/cad/CadManager';
import { CadModelMetadataRepository } from '@/datamodels/cad/CadModelMetadataRepository';
import { DefaultCadTransformation } from '@/datamodels/cad/DefaultCadTransformation';
import { CadMetadataParser } from '@/datamodels/cad/parsers/CadMetadataParser';
import { CadModelFactory } from '@/datamodels/cad/CadModelFactory';
import { ByVisibilityGpuSectorCuller } from '@/internal';
import { CadModelUpdateHandler } from '@/datamodels/cad/CadModelUpdateHandler';
import { PointCloudManager } from '@/datamodels/pointcloud/PointCloudManager';
import { PointCloudMetadataRepository } from '@/datamodels/pointcloud/PointCloudMetadataRepository';
import { PointCloudFactory } from '@/datamodels/pointcloud/PointCloudFactory';
import { DefaultPointCloudTransformation } from '@/datamodels/pointcloud/DefaultPointCloudTransformation';
import { BoundingBoxClipper, File3dFormat, isMobileOrTablet } from '@/utilities';
import { Spinner } from '@/utilities/Spinner';
import { addPostRenderEffects } from '@/datamodels/cad/rendering/postRenderEffects';

export interface RelativeMouseEvent {
  offsetX: number;
  offsetY: number;
}

type RequestParams = { modelRevision: IdEither; format: File3dFormat };
type PointerEventDelegate = (event: { offsetX: number; offsetY: number }) => void;
type CameraChangeDelegate = (position: THREE.Vector3, target: THREE.Vector3) => void;

// Reusable buffers used by functions in Cognite3dViewer to avoid allocations
const UpdateNearAndFarPlaneBuffers = {
  combinedBbox: new THREE.Box3(),
  bbox: new THREE.Box3(),
  point: new THREE.Vector3(),
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

export class Cognite3DViewer {
  private get canvas(): HTMLCanvasElement {
    return this.renderer.domElement;
  }
  static isBrowserSupported(): boolean {
    return true;
  }

  readonly domElement: HTMLElement;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly scene: THREE.Scene;
  private readonly controls: ComboControls;
  private readonly sdkClient: CogniteClient;
  private readonly sectorRepository: CachedRepository;
  private readonly cadManager: CadManager<RequestParams>;
  private readonly pointCloudManager: PointCloudManager<RequestParams>;
  private readonly revealManager: RevealManagerBase<RequestParams>;

  private readonly _loadingSubscription: Subscription = new Subscription();
  private readonly _updateCameraNearAndFarSubject: Subject<THREE.PerspectiveCamera>;

  private readonly eventListeners = {
    cameraChange: new Array<CameraChangeDelegate>(),
    click: new Array<PointerEventDelegate>(),
    hover: new Array<PointerEventDelegate>()
  };
  private readonly models: CogniteModelBase[] = [];
  private readonly extraObjects: THREE.Object3D[] = [];

  private isDisposed = false;
  private readonly forceRendering = false; // For future support

  private readonly renderController: RenderController;
  private latestRequestId: number = -1;
  private readonly clock = new THREE.Clock();
  private readonly materialManager: MaterialManager;
  private _slicingNeedsUpdate: boolean = false;
  private _geometryFilters: GeometryFilter[] = [];

  private readonly spinner: Spinner;

  constructor(options: Cognite3DViewerOptions) {
    if (options.enableCache) {
      throw new NotSupportedInMigrationWrapperError('Cache is not supported');
    }
    if (options.logMetrics) {
      throw new NotSupportedInMigrationWrapperError('LogMetris is not supported');
    }
    if (options.viewCube) {
      throw new NotSupportedInMigrationWrapperError('ViewCube is not supported');
    }

    this.renderer =
      options.renderer ||
      new THREE.WebGLRenderer({
        antialias: shouldEnableAntialiasing(),
        preserveDrawingBuffer: true
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
    this.materialManager = new MaterialManager();
    const modelDataParser: CadSectorParser = new CadSectorParser();
    const modelDataTransformer = new SimpleAndDetailedToSector3D(this.materialManager);
    const cogniteClientExtension = new CogniteClient3dExtensions(this.sdkClient);
    const cadModelRepository = new CadModelMetadataRepository(
      cogniteClientExtension,
      new DefaultCadTransformation(),
      new CadMetadataParser()
    );
    const cadModelFactory = new CadModelFactory(this.materialManager);
    const sectorCuller = options._sectorCuller || new ByVisibilityGpuSectorCuller();
    this.sectorRepository = new CachedRepository(cogniteClientExtension, modelDataParser, modelDataTransformer);
    const cadModelUpdateHandler = new CadModelUpdateHandler(this.sectorRepository, sectorCuller);
    this.cadManager = new CadManager<RequestParams>(cadModelRepository, cadModelFactory, cadModelUpdateHandler);

    const pointCloudModelRepository: PointCloudMetadataRepository<RequestParams> = new PointCloudMetadataRepository(
      cogniteClientExtension,
      new DefaultPointCloudTransformation()
    );
    const pointCloudFactory: PointCloudFactory = new PointCloudFactory(cogniteClientExtension);
    this.pointCloudManager = new PointCloudManager(pointCloudModelRepository, pointCloudFactory);
    this.revealManager = new RevealManagerBase(this.cadManager, this.materialManager, this.pointCloudManager);
    this.startPointerEventListeners();

    this._loadingSubscription.add(
      combineLatest([this.sectorRepository.getLoadingStateObserver(), this.pointCloudManager.getLoadingStateObserver()])
        .pipe(
          map(([pointCloudLoading, cadLoading]) => pointCloudLoading || cadLoading),
          distinctUntilChanged()
        )
        .subscribe(
          isLoading => {
            if (isLoading) {
              this.spinner.show();
            } else {
              this.spinner.hide();
            }
          },
          // tslint:disable-next-line:no-console
          (message, ...optionalArgs) => console.error(message, ...optionalArgs)
        )
    );

    this._updateCameraNearAndFarSubject = this.setupUpdateCameraNearAndFar();

    this.animate(0);
  }

  dispose(): void {
    if (this.isDisposed) {
      return;
    }

    this.isDisposed = true;

    if (this.latestRequestId !== undefined) {
      cancelAnimationFrame(this.latestRequestId);
    }

    this._loadingSubscription.unsubscribe();
    this.revealManager.dispose();
    this.domElement.removeChild(this.canvas);
    this.renderer.dispose();
    this.scene.dispose();
    for (const model of this.models.values()) {
      model.dispose();
    }
    this.models.splice(0);
    this.spinner.dispose();
  }

  on(event: 'click' | 'hover', callback: PointerEventDelegate): void;
  on(event: 'cameraChange', callback: CameraChangeDelegate): void;
  on(event: 'click' | 'hover' | 'cameraChange', callback: any): void {
    switch (event) {
      case 'click':
        this.eventListeners.click.push(callback);
        break;

      case 'hover':
        this.eventListeners.hover.push(callback);
        break;

      case 'cameraChange':
        this.eventListeners.cameraChange.push(callback);
        break;

      default:
        throw new Error(`Unsupported event "${event}"`);
    }
  }

  off(event: 'click' | 'hover', callback: PointerEventDelegate): void;
  off(event: 'cameraChange', callback: CameraChangeDelegate): void;
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

  async addModel(options: AddModelOptions): Promise<Cognite3DModel> {
    if (options.localPath) {
      throw new NotSupportedInMigrationWrapperError();
    }

    const cadNode = await this.cadManager.addModel({
      modelRevision: { id: options.revisionId },
      format: File3dFormat.RevealCadModel
    });

    if (options.geometryFilter) {
      this._geometryFilters.push(options.geometryFilter);
      this.setSlicingPlanes(this.revealManager.clippingPlanes);
    }

    const model3d = new Cognite3DModel(options.modelId, options.revisionId, cadNode, this.sdkClient);
    this._loadingSubscription.add(
      this.sectorRepository
        .getParsedData()
        .pipe(
          share(),
          filter(x => x.blobUrl === cadNode.cadModelMetadata.blobUrl)
        )
        .subscribe(parseSector => model3d.updateNodeIdMaps(parseSector))
    );

    this.models.push(model3d);
    this.scene.add(model3d);

    return model3d;
  }

  async addPointCloudModel(options: AddModelOptions): Promise<CognitePointCloudModel> {
    if (options.localPath) {
      throw new NotSupportedInMigrationWrapperError();
    }
    if (options.geometryFilter) {
      throw new NotSupportedInMigrationWrapperError();
    }
    if (options.orthographicCamera) {
      throw new NotSupportedInMigrationWrapperError();
    }

    // TODO 25-05-2020 j-bjorne: fix this hot mess, 1 group added multiple times
    const [potreeGroup, potreeNode] = await this.pointCloudManager.addModel({
      modelRevision: { id: options.revisionId },
      format: File3dFormat.EptPointCloud
    });
    const model = new CognitePointCloudModel(options.modelId, options.revisionId, potreeGroup, potreeNode);
    this.models.push(model);
    this.scene.add(model);
    return model;
  }

  async determineModelType(_modelId: number, revisionId: number): Promise<SupportedModelTypes> {
    const clientExt = new CogniteClient3dExtensions(this.sdkClient);
    const id: IdEither = { id: revisionId };
    const outputs = await clientExt.getOutputs(id, [File3dFormat.RevealCadModel, File3dFormat.EptPointCloud]);
    if (outputs.findMostRecentOutput(File3dFormat.RevealCadModel) !== undefined) {
      return SupportedModelTypes.CAD;
    } else if (outputs.findMostRecentOutput(File3dFormat.EptPointCloud) !== undefined) {
      return SupportedModelTypes.PointCloud;
    }
    return SupportedModelTypes.NotSupported;
  }

  addObject3D(object: THREE.Object3D): void {
    if (this.isDisposed) {
      return;
    }
    this.scene.add(object);
    this.extraObjects.push(object);
    this.renderController.redraw();
  }

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

  setBackgroundColor(color: THREE.Color) {
    if (this.isDisposed) {
      return;
    }

    this.renderer.setClearColor(color);
  }

  setSlicingPlanes(slicingPlanes: THREE.Plane[]): void {
    const geometryFilterPlanes = this._geometryFilters
      .map(x => new BoundingBoxClipper(x.boundingBox).clippingPlanes)
      .reduce((a, b) => a.concat(b), []);

    const combinedSlicingPlanes = slicingPlanes.concat(geometryFilterPlanes);
    this.renderer.localClippingEnabled = combinedSlicingPlanes.length > 0;
    this.revealManager.clippingPlanes = combinedSlicingPlanes;
    this._slicingNeedsUpdate = true;
  }

  getCamera(): THREE.Camera {
    return this.camera;
  }
  getScene(): THREE.Scene {
    return this.scene;
  }

  getCameraPosition(): THREE.Vector3 {
    if (this.isDisposed) {
      return new THREE.Vector3(-Infinity, -Infinity, -Infinity);
    }
    return this.controls.getState().position.clone();
  }
  getCameraTarget(): THREE.Vector3 {
    if (this.isDisposed) {
      return new THREE.Vector3(-Infinity, -Infinity, -Infinity);
    }
    return this.controls.getState().target.clone();
  }
  setCameraPosition(position: THREE.Vector3): void {
    if (this.isDisposed) {
      return;
    }
    this.controls.setState(position, this.getCameraTarget());
  }
  setCameraTarget(target: THREE.Vector3): void {
    if (this.isDisposed) {
      return;
    }
    this.controls.setState(this.getCameraPosition(), target);
  }

  fitCameraToModel(model: CogniteModelBase, duration?: number): void {
    const bounds = model.getModelBoundingBox();
    this.fitCameraToBoundingBox(bounds, duration);
  }

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
    position
      .copy(direction)
      .multiplyScalar(-distance)
      .add(target);

    this.moveCameraTo(position, target, duration);
  }

  enableKeyboardNavigation(): void {
    this.controls.enableKeyboardNavigation = true;
  }
  disableKeyboardNavigation(): void {
    this.controls.enableKeyboardNavigation = false;
  }

  worldToScreen(_point: THREE.Vector3, _normalize?: boolean): THREE.Vector2 | null {
    const p = from3DPositionToRelativeViewportCoordinates(this.camera, _point);
    if (p.x < 0 || p.x > 1 || p.y < 0 || p.y > 1 || p.z < 0 || p.z > 1) {
      // Return null if point is outside camera frustum.
      return null;
    }
    if (!_normalize) {
      const canvas = this.renderer.domElement;
      p.x = Math.round(p.x * canvas.clientWidth);
      p.y = Math.round(p.y * canvas.clientHeight);
    }
    return new THREE.Vector2(p.x, p.y);
  }

  async getScreenshot(width = this.canvas.width, height = this.canvas.height): Promise<string> {
    if (this.isDisposed) {
      throw new Error('Viewer is disposed');
    }

    const { width: originalWidth, height: originalHeight } = this.canvas;

    const screenshotCamera = this.camera.clone();
    adjustCamera(screenshotCamera, width, height);

    this.renderer.setSize(width, height);
    this.renderer.render(this.scene, screenshotCamera);
    addPostRenderEffects(this.materialManager, this.renderer, screenshotCamera, this.scene);
    const url = this.renderer.domElement.toDataURL();

    this.renderer.setSize(originalWidth, originalHeight);
    this.renderer.render(this.scene, this.camera);

    return url;
  }

  getIntersectionFromPixel(offsetX: number, offsetY: number, _cognite3DModel?: Cognite3DModel): null | Intersection {
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
      .start();
  }

  private async animate(time: number) {
    if (this.isDisposed) {
      return;
    }
    // if (this._onBeforeRender) {
    //   this._onBeforeRender();
    // }
    const { display, visibility } = window.getComputedStyle(this.canvas);
    const isVisible = visibility === 'visible' && display !== 'none';

    if (isVisible) {
      const { renderController } = this;
      // if (this._enableProfiler) {
      //   this._performanceMonitor.begin();
      // }
      TWEEN.update(time);
      const didResize = this.resizeIfNecessary();
      if (didResize) {
        renderController.redraw();
      }
      this.controls.update(this.clock.getDelta());
      renderController.update();
      this.revealManager.update(this.camera);
      if (
        renderController.needsRedraw ||
        this.forceRendering ||
        this.revealManager.needsRedraw ||
        this._slicingNeedsUpdate
      ) {
        this.triggerUpdateCameraNearAndFar();
        this.renderer.render(this.scene, this.camera);
        addPostRenderEffects(this.materialManager, this.renderer, this.camera, this.scene);
        renderController.clearNeedsRedraw();
        this.revealManager.resetRedraw();
        this._slicingNeedsUpdate = false;
      }
    }

    this.latestRequestId = requestAnimationFrame(this.animate.bind(this));
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
    if (this.isDisposed) {
      return;
    }
    const { combinedBbox, bbox, point, corners } = UpdateNearAndFarPlaneBuffers;
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
    const cameraPosition = camera.getWorldPosition(point);
    let nearest = Math.max(0.1, combinedBbox.distanceToPoint(cameraPosition));
    let farthest = -Infinity;
    for (let i = 0; i < 8; ++i) {
      const dist = corners[i].distanceTo(cameraPosition);
      farthest = Math.max(farthest, dist);
    }

    // Handle when camera is inside the model
    const diagonal = combinedBbox.min.distanceTo(combinedBbox.max);
    if (combinedBbox.containsPoint(cameraPosition)) {
      nearest = Math.min(0.1, farthest / 1000.0);
    }
    farthest = nearest + diagonal;
    camera.near = nearest;
    camera.far = farthest;
    camera.updateProjectionMatrix();
    // The minDistance of the camera controller determines at which distance
    // we will push the target in front of us instead of getting closer to it.
    // This is also used to determine the speed of the camera when flying with ASDW.
    // We want to either let it be controlled by the near plane if we are far away,
    // but no more than a fraction of the bounding box of the system if inside
    this.controls.minDistance = Math.max(diagonal * 0.02, 0.1 * nearest);
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
      for (const _ of this.eventListeners.hover) {
        this.eventListeners.hover[0](mouseEventOffset(e, canvas));
      }
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
