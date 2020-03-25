/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';
import ComboControls from '@cognite/three-combo-controls';

import { Cognite3DModel, createCognite3DModel } from './Cognite3DModel';
import { Cognite3DViewerOptions, AddModelOptions, Cognite3DThreeRenderer } from './types';
import { NotSupportedInMigrationWrapperError } from './NotSupportedInMigrationWrapperError';
import { Intersection } from './intersection';
import { CogniteClient } from '@cognite/sdk';
import RenderController from './RenderController';
import { from3DPositionToRelativeViewportCoordinates } from '../views/threejs/worldToViewport';

export class Cognite3DViewer {
  private get canvas(): HTMLCanvasElement {
    return this.renderer.domElement;
  }
  static isBrowserSupported(): boolean {
    return true;
  }

  readonly domElement: HTMLElement;
  private readonly renderer: THREE.WebGLRenderer | Cognite3DThreeRenderer;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly scene: THREE.Scene;
  private readonly controls: ComboControls;
  private readonly sdkClient: CogniteClient;

  private readonly eventListeners = {
    cameraChange: new Array<(pos: THREE.Vector3, target: THREE.Vector3) => void>()
  };
  private readonly models: Cognite3DModel[] = [];

  private isDisposed = false;
  private readonly forceRendering = false; // For future support

  private readonly renderController: RenderController;
  private latestRequestId: number = -1;
  private readonly clock = new THREE.Clock();

  constructor(options: Cognite3DViewerOptions) {
    if (options.enableCache) {
      throw new NotSupportedInMigrationWrapperError('Cache is not supported');
    }
    if (options.logMetrics) {
      throw new NotSupportedInMigrationWrapperError('LogMetris is not supported');
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

    this.domElement.removeChild(this.canvas);
    this.renderer.dispose();
    this.scene.dispose();
    while (this.models.length > 0) {
      const model = this.models.pop()!;
      model.dispose();
    }
  }

  on(event: 'click' | 'hover', _callback: (event: PointerEvent) => void): void;
  on(event: 'cameraChanged', _callback: (position: THREE.Vector3, target: THREE.Vector3) => void): void;

  on(event: 'click' | 'hover' | 'cameraChanged', callback: any): void {
    switch (event) {
      case 'click':
        this.onClick(callback);
        break;

      case 'hover':
        this.onHover(callback);
        break;

      case 'cameraChanged':
        this.onCameraChange(callback);
        break;

      default:
        throw new Error(`Unsupported event "${event}"`);
    }
  }

  off(event: 'click' | 'hover', _callback: (event: PointerEvent) => void): void;
  off(event: 'cameraChanged', _callback: (position: THREE.Vector3, target: THREE.Vector3) => void): void;
  off(event: 'click' | 'hover' | 'cameraChanged', callback: any): void {
    switch (event) {
      case 'click':
        this.offClick(callback);
        break;

      case 'hover':
        this.offHover(callback);
        break;

      case 'cameraChanged':
        this.offCameraChange(callback);
        break;

      default:
        throw new Error(`Unsupported event "${event}"`);
    }
  }

  async addModel(options: AddModelOptions): Promise<Cognite3DModel> {
    if (options.localPath) {
      throw new NotSupportedInMigrationWrapperError();
    } else {
      const model3d = await createCognite3DModel(options.modelId, options.revisionId, this.sdkClient);
      this.models.push(model3d);
      this.scene.add(model3d);
      return model3d;
    }
  }

  addObject3D(_object: THREE.Object3D): void {
    throw new NotSupportedInMigrationWrapperError();
  }
  removeObject3D(_object: THREE.Object3D): void {
    throw new NotSupportedInMigrationWrapperError();
  }

  setSlicingPlanes(_slicingPlanes: THREE.Plane[]): void {
    throw new NotSupportedInMigrationWrapperError();
  }

  getCameraPosition(): THREE.Vector3 {
    if (this.isDisposed) {
      return new THREE.Vector3(-Infinity, -Infinity, -Infinity);
    }
    return this.controls.getState().position;
  }
  getCameraTarget(): THREE.Vector3 {
    if (this.isDisposed) {
      return new THREE.Vector3(-Infinity, -Infinity, -Infinity);
    }
    return this.controls.getState().target;
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

  fitCameraToModel(model: Cognite3DModel, duration?: number): void {
    const bounds = model.getBoundingBox();
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
    throw new NotSupportedInMigrationWrapperError();
  }
  disableKeyboardNavigation(): void {
    throw new NotSupportedInMigrationWrapperError();
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

  getScreenshot(_width?: number, _height?: number): Promise<string> {
    throw new NotSupportedInMigrationWrapperError();
  }
  getIntersectionFromPixel(_x: number, _y: number, _cognite3DModel?: Cognite3DModel): null | Intersection {
    throw new NotSupportedInMigrationWrapperError();
  }

  clearCache(): void {
    throw new NotSupportedInMigrationWrapperError('Cache is not supported');
  }

  private onClick(_callback: (event: PointerEvent) => void): void {
    throw new NotSupportedInMigrationWrapperError();
  }
  private offClick(_callback: (event: PointerEvent) => void): void {
    throw new NotSupportedInMigrationWrapperError();
  }
  private onHover(_callback: (event: PointerEvent) => void): void {
    throw new NotSupportedInMigrationWrapperError();
  }
  private offHover(_callback: (event: PointerEvent) => void): void {
    throw new NotSupportedInMigrationWrapperError();
  }
  private onCameraChange(callback: (position: THREE.Vector3, target: THREE.Vector3) => void): void {
    this.eventListeners.cameraChange.push(callback);
  }
  private offCameraChange(callback: (position: THREE.Vector3, target: THREE.Vector3) => void): void {
    this.eventListeners.cameraChange = this.eventListeners.cameraChange.filter(x => x !== callback);
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
      const modelsNeedsUpdate = (await Promise.all(this.models.map(m => m.cadNode.update(this.camera)))).some(x => x);
      if (renderController.needsRedraw || this.forceRendering || modelsNeedsUpdate) {
        this.updateNearAndFarPlane(this.camera);
        this.renderer.render(this.scene, this.camera);
        renderController.clearNeedsRedraw();
      }
    }

    this.latestRequestId = requestAnimationFrame(this.animate.bind(this));
  }

  private updateNearAndFarPlane(_camera: THREE.Camera) {
    // TODO 2020-03-15 larsmoa: Implement updateNearAndFarPlane
    // if (this._isDisposed) {
    //   return;
    // }
    // if (this._models.length === 0) {
    //   return;
    // }
    // // Update near and far plane based on bounding boxes of all model to increase depth precision.
    // const boundingBox = tempBox1; // Reuse tempBox1
    // boundingBox.makeEmpty();
    // const smallestMeanObjectSize = this._getSmallestMeanObjectSize();
    // this._models.forEach(model => {
    //   boundingBox.union(model.getBoundingBox(null, tempBox2));
    // });
    // this._additionalObjects.forEach(object => {
    //   tempBox2.makeEmpty();
    //   tempBox2.setFromObject(object);
    //   boundingBox.union(tempBox2);
    // });
    // const { near, far } = calculateNearAndFarDistanceForBoundingBox(camera, boundingBox);
    // if (boundingBox.isEmpty()) {
    //   return;
    // }
    // const boundingBoxNear = near;
    // const boundingBoxFar = far;
    // // We want to have as large far plane as possible to see objects far away.
    // // We also want to have as near far plane as possible to see objects close to the camera.
    // // However, depth precision gets worse with low near plane value, so we need to be clever.
    // // We follow these rules (in this order):
    // // 1) If the far plane is somewhat close to the camera, we can have near plane 1/1000th of far plane.
    // // 2) If the camera is far away from the bounding box containing all the objects, choose the the nearest
    // //    point on the bounding box.
    // // 3) If we are inside the bounding box, choose the near plane equal to the size of the smallest mean object
    // //    of the models.
    // camera.near = Math.min(boundingBoxFar / 1e3, Math.max(0.1 * smallestMeanObjectSize, boundingBoxNear));
    // camera.far = boundingBoxFar;
    // camera.updateProjectionMatrix();
    // // The minDistance of the camera controller determines at which distance
    // // we will push the target in front of us instead of getting closer to it.
    // // This is also used to determine the speed of the camera when flying with ASDW.
    // // We want to either let it be controlled by the near plane if we are far away,
    // // or the smallest mean object size when the camera is inside the bounding box containing all objects,
    // // but no more than a fraction of the bounding box of the system if inside
    // const systemDiagonal = boundingBox.max.distanceTo(boundingBox.min);
    // this._controls.minDistance = Math.max(
    //   Math.min(2.0 * smallestMeanObjectSize, systemDiagonal * 0.02),
    //   0.1 * boundingBoxNear // If the nearest point on bounding box is far away,
    //   // choose a fraction of it as minDistance
    // );
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
