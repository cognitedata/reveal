/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';
import { ComboControls } from './ComboControls';
import {
  CameraManagerCallbackData,
  CameraControlsOptions,
  CameraChangeData,
  PointerEventDelegate,
  ControlsState
} from './types';
import { assertNever, EventTrigger, InputHandler, disposeOfAllEventListeners } from '@reveal/utilities';
import range from 'lodash/range';
export class CameraManager {
  private readonly _events = {
    cameraChange: new EventTrigger<CameraChangeData>()
  };

  private readonly _controls: ComboControls;
  private readonly _camera: THREE.PerspectiveCamera;
  private readonly _domElement: HTMLElement;
  private readonly _inputHandler: InputHandler;
  private readonly _raycaster = new THREE.Raycaster();

  private isDisposed = false;

  private readonly _modelRaycastCallback: (x: number, y: number) => Promise<CameraManagerCallbackData>;
  private _onClick: ((event: MouseEvent) => void) | undefined = undefined;
  private _onWheel: ((event: MouseEvent) => void) | undefined = undefined;

  private static readonly DefaultAnimationDuration = 300;
  private static readonly DefaultMinAnimationDuration = 300;
  private static readonly DefaultMaxAnimationDuration = 1250;
  private static readonly DefaultMinDistance = 0.8;
  private static readonly DefaultMinZoomDistance = 0.4;
  private static readonly DefaultMinimalTimeBetweenRaycasts = 0.08;
  private static readonly DefaultCameraControlsOptions: Required<CameraControlsOptions> = {
    mouseWheelAction: 'zoomPastCursor',
    changeCameraTargetOnClick: false
  };

  private _cameraControlsOptions: Required<CameraControlsOptions> = { ...CameraManager.DefaultCameraControlsOptions };

  public automaticNearFarPlane = true;
  public automaticControlsSensitivity = true;

  /**
   * Reusable buffers used by functions in Cognite3dViewer to avoid allocations.
   */
  private readonly _updateNearAndFarPlaneBuffers = {
    cameraPosition: new THREE.Vector3(),
    cameraDirection: new THREE.Vector3(),
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

  private readonly _calculateCameraFarBuffers = {
    nearPlaneCoplanarPoint: new THREE.Vector3(),
    nearPlane: new THREE.Plane()
  };

  constructor(
    camera: THREE.PerspectiveCamera,
    domElement: HTMLElement,
    raycastFunction: (x: number, y: number) => Promise<CameraManagerCallbackData>,
  ) {
    this._camera = camera;
    this._domElement = domElement;
    this._inputHandler = new InputHandler(domElement);
    this._modelRaycastCallback = raycastFunction;

    this.setCameraControlsOptions(this._cameraControlsOptions);
    this._controls = new ComboControls(camera, domElement);
    this._controls.minZoomDistance = CameraManager.DefaultMinZoomDistance;

    this._controls.addEventListener('cameraChange', event => {
      const { position, target } = event.camera;
      this._events.cameraChange.fire({ camera: { position: position.clone(), target: target.clone() } });
    });

    if (!camera) {
      this._camera = new THREE.PerspectiveCamera(60, undefined, 0.1, 10000);

      // TODO savokr 28-10-2021: Consider removing default camera position initialization
      this._camera.position.x = 30;
      this._camera.position.y = 10;
      this._camera.position.z = 50;
      this._camera.lookAt(new THREE.Vector3());
    }
  }

  on(event: 'cameraChange', callback: CameraChangeData): void {
    switch (event) {
      case 'cameraChange':
        this._events.cameraChange.subscribe(callback as CameraChangeData);
        break;
      default:
        assertNever(event);
    }
  }

  off(event: 'cameraChange', callback: CameraChangeData): void {
    switch (event) {
      case 'cameraChange':
        this._events.cameraChange.subscribe(callback as CameraChangeData);
        break;
      default:
        assertNever(event);
    }
  }

  fitCameraToBoundingBox(box: THREE.Box3, duration?: number, radiusFactor: number = 2): void {
    const boundingSphere = box.getBoundingSphere(new THREE.Sphere());

    const target = boundingSphere.center;
    const distance = boundingSphere.radius * radiusFactor;
    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyQuaternion(this._camera.quaternion);

    const position = new THREE.Vector3();
    position.copy(direction).multiplyScalar(-distance).add(target);

    this.moveCameraTo(position, target, duration);
  }

  set cameraControlsEnabled(enabled: boolean) {
    this._controls.enabled = enabled;
  }

  get cameraControlsEnabled(): boolean {
    return this._controls.enabled;
  }

  set keyboardNavigationEnabled(enabled: boolean) {
    this._controls.enableKeyboardNavigation = enabled;
  }

  get keyboardNavigationEnabled(): boolean {
    return this._controls.enableKeyboardNavigation;
  }

  get cameraControls(): ComboControls {
    return this._controls;
  }

  setCameraTarget(target: THREE.Vector3, animated: boolean = false): void {
    if (this.isDisposed) {
      return;
    }

    const animationTime = animated ? CameraManager.DefaultAnimationDuration : 0;
    this.moveCameraTargetTo(target, animationTime);
  }

  setCameraControlsState(controlsState: ControlsState): void {
    this._controls.setState(controlsState.position, controlsState.target);
  }

  getCameraControlsState(): ControlsState {
    return this._controls.getState();
  }

  getCameraControlsOptions(): CameraControlsOptions {
    return this._cameraControlsOptions;
  }

  setCameraControlsOptions(controlsOptions: CameraControlsOptions): void {
    this._cameraControlsOptions = { ...CameraManager.DefaultCameraControlsOptions, ...controlsOptions };

    this.teardownControls(false);
    this.setupControls();
  }

  moveCameraTo(position: THREE.Vector3, target: THREE.Vector3, duration?: number): void {
    if (this.isDisposed) {
      return;
    }

    const { _camera } = this;

    duration = duration ?? this.calculateDefaultDuration(target.distanceTo(_camera.position));

    const startTarget = this.calculateAnimationStartTarget(target);

    const from = {
      x: _camera.position.x,
      y: _camera.position.y,
      z: _camera.position.z,
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

    const tempTarget = new THREE.Vector3();
    const tempPosition = new THREE.Vector3();

    const { tween, stopTween } = this.createTweenAnimation(from, to, duration);

    tween
      .onUpdate(() => {
        if (this.isDisposed) {
          return;
        }
        tempPosition.set(from.x, from.y, from.z);
        tempTarget.set(from.targetX, from.targetY, from.targetZ);
        if (!this._camera) {
          return;
        }

        this._controls.setState(tempPosition, tempTarget);
      })
      .onStop(() => {
        this._controls.setState(tempPosition, tempTarget);
      })
      .onComplete(() => {
        if (this.isDisposed) {
          return;
        }
        this._domElement.removeEventListener('pointerdown', stopTween);
      })
      .start(TWEEN.now());
    tween.update(TWEEN.now());
  }

  moveCameraTargetTo(target: THREE.Vector3, duration?: number): void {
    if (this.isDisposed) {
      return;
    }

    if (duration === 0) {
      this._controls.setState(this._camera.position, target);
      return;
    }

    const { _camera, _controls: controls } = this;

    duration = duration ?? this.calculateDefaultDuration(target.distanceTo(_camera.position));

    const startTarget = this.calculateAnimationStartTarget(target);
    const from = {
      targetX: startTarget.x,
      targetY: startTarget.y,
      targetZ: startTarget.z
    };
    const to = {
      targetX: target.x,
      targetY: target.y,
      targetZ: target.z
    };

    const tempTarget = new THREE.Vector3();

    const { tween, stopTween } = this.createTweenAnimation(from, to, duration);

    tween
      .onStart(() => {
        controls.lookAtViewTarget = true;
        controls.setState(this._camera.position, target);
      })
      .onUpdate(() => {
        if (this.isDisposed) {
          return;
        }
        tempTarget.set(from.targetX, from.targetY, from.targetZ);
        if (!this._camera) {
          return;
        }

        if (this._cameraControlsOptions.mouseWheelAction === 'zoomToCursor') controls.setScrollTarget(tempTarget);
        controls.setViewTarget(tempTarget);
      })
      .onStop(() => {
        controls.lookAtViewTarget = false;
        controls.setState(this._camera.position, tempTarget);
      })
      .onComplete(() => {
        if (this.isDisposed) {
          return;
        }

        controls.lookAtViewTarget = false;
        controls.enableKeyboardNavigation = true;
        controls.setState(this._camera.position, tempTarget);

        this._domElement.removeEventListener('pointerdown', stopTween);
      })
      .start(TWEEN.now());
    tween.update(TWEEN.now());
  }

  updateCameraNearAndFar(camera: THREE.PerspectiveCamera, combinedBbox: THREE.Box3): void {
    // See https://stackoverflow.com/questions/8101119/how-do-i-methodically-choose-the-near-clip-plane-distance-for-a-perspective-proj
    if (this.isDisposed) {
      return;
    }
    if (!this.automaticControlsSensitivity && !this.automaticNearFarPlane) {
      return;
    }

    const { cameraPosition, cameraDirection, corners } = this._updateNearAndFarPlaneBuffers;
    getBoundingBoxCorners(combinedBbox, corners);
    camera.getWorldPosition(cameraPosition);
    camera.getWorldDirection(cameraDirection);

    // 1. Compute nearest to fit the whole bbox (the case
    // where the camera is inside the box is ignored for now)
    let near = this.calculateCameraNear(camera, combinedBbox, cameraPosition);

    // 2. Compute the far distance to the distance from camera to furthest
    // corner of the boundingbox that is "in front" of the near plane
    const far = this.calculateCameraFar(near, cameraPosition, cameraDirection, corners);

    // 3. Handle when camera is inside the model by adjusting the near value
    const diagonal = combinedBbox.min.distanceTo(combinedBbox.max);
    if (combinedBbox.containsPoint(cameraPosition)) {
      near = Math.min(0.1, far / 1000.0);
    }

    // Apply
    if (this.automaticNearFarPlane) {
      camera.near = near;
      camera.far = far;
      camera.updateProjectionMatrix();
    }
    if (this.automaticControlsSensitivity) {
      // The minDistance of the camera controller determines at which distance
      // we will stop when zooming with mouse wheel.
      // This is also used to determine the speed of the camera when flying with ASDW.
      // We want to either let it be controlled by the near plane if we are far away,
      // but no more than a fraction of the bounding box of the system if inside
      this._controls.minDistance = Math.min(Math.max(diagonal * 0.02, 0.1 * near), CameraManager.DefaultMinDistance);
    }
  }

  updateCameraControlsState(deltaTime: number): void {
    this._controls.update(deltaTime);
  }

  dispose(): void {
    this.isDisposed = true;
    this._controls.dispose();
    this.teardownControls();
    disposeOfAllEventListeners(this._events);
    this._inputHandler.dispose();
  }

  private calculateAnimationStartTarget(newTarget: THREE.Vector3): THREE.Vector3 {
    const { _raycaster, _camera } = this;
    _raycaster.setFromCamera(new THREE.Vector2(), _camera);
    const distanceToTarget = newTarget.distanceTo(_camera.position);
    const scaledDirection = _raycaster.ray.direction.clone().multiplyScalar(distanceToTarget);

    return _raycaster.ray.origin.clone().add(scaledDirection);
  }

  private createTweenAnimation(
    from: any,
    to: any,
    duration: number
  ): { tween: TWEEN.Tween; stopTween: (event: Event) => void } {
    const animation = new TWEEN.Tween(from);
    const stopTween = (event: Event) => {
      if (this.isDisposed) {
        document.removeEventListener('keydown', stopTween);
        animation.stop();
        return;
      }

      if (event.type !== 'keydown' || this._controls.enableKeyboardNavigation) {
        animation.stop();
        this._domElement.removeEventListener('pointerdown', stopTween);
        this._domElement.removeEventListener('wheel', stopTween);
        document.removeEventListener('keydown', stopTween);
      }
    };

    this._domElement.addEventListener('pointerdown', stopTween);
    this._domElement.addEventListener('wheel', stopTween);
    document.addEventListener('keydown', stopTween);

    const tween = animation.to(to, duration).easing((x: number) => TWEEN.Easing.Circular.Out(x));

    return { tween, stopTween };
  }

  private calculateCameraFar(
    near: number,
    cameraPosition: THREE.Vector3,
    cameraDirection: THREE.Vector3,
    corners: Array<THREE.Vector3>
  ): number {
    const { nearPlane, nearPlaneCoplanarPoint } = this._calculateCameraFarBuffers;

    nearPlaneCoplanarPoint.copy(cameraPosition).addScaledVector(cameraDirection, near);
    nearPlane.setFromNormalAndCoplanarPoint(cameraDirection, nearPlaneCoplanarPoint);
    let far = -Infinity;
    for (let i = 0; i < corners.length; ++i) {
      if (nearPlane.distanceToPoint(corners[i]) >= 0) {
        const dist = corners[i].distanceTo(cameraPosition);
        far = Math.max(far, dist);
      }
    }
    far = Math.max(near * 2, far);

    return far;
  }

  private calculateCameraNear(
    camera: THREE.PerspectiveCamera,
    combinedBbox: THREE.Box3,
    cameraPosition: THREE.Vector3
  ): number {
    let near = combinedBbox.distanceToPoint(cameraPosition);
    near /= Math.sqrt(1 + Math.tan(((camera.fov / 180) * Math.PI) / 2) ** 2 * (camera.aspect ** 2 + 1));
    near = Math.max(0.1, near);

    return near;
  }

  /**
   * Calculates new target when raycaster doesn't have any intersections with the model.
   * @param cursorPosition Cursor position for desired calculations.
   * @param cursorPosition.x
   * @param cursorPosition.y
   */
  private calculateNewTargetWithoutModel(
    cursorPosition: { x: number; y: number },
    modelsBoundingBox: THREE.Box3
  ): THREE.Vector3 {
    const modelSize = modelsBoundingBox.min.distanceTo(modelsBoundingBox.max);
    
    const lastScrollTargetDistance = this.cameraControls.getScrollTarget().distanceTo(this._camera.position),
      lastTargetDistance = this.cameraControls.getState().target.distanceTo(this._camera.position);

    const newTargetDistance = (lastScrollTargetDistance <= this.cameraControls.minDistance) ? 
      Math.min(this._camera.position.distanceTo(modelsBoundingBox.getCenter(new THREE.Vector3())), modelSize)/2 :
      lastScrollTargetDistance;
    console.log('d', lastScrollTargetDistance)  
    this._raycaster.setFromCamera(cursorPosition, this._camera);

    const farPoint = this._raycaster.ray.direction
      .clone()
      .normalize()
      .multiplyScalar(newTargetDistance)
      .add(this._camera.position);

    return farPoint;
  }

  /**
   * Calculates new camera target based on cursor position.
   * @param event MouseEvent that contains pointer location data.
   */
  private async calculateNewTarget(event: MouseEvent): Promise<THREE.Vector3> {
    const { offsetX, offsetY } = event;
    const { x, y } = this.convertPixelCoordinatesToNormalized(offsetX, offsetY);

    const modelRaycastData = await this._modelRaycastCallback(offsetX, offsetY);

    const newTarget =
      modelRaycastData.intersection?.point ??
      this.calculateNewTargetWithoutModel({ x, y }, modelRaycastData.modelsBoundingBox);

    return newTarget;
  }

  /**
   * Removes controls event listeners if they are defined.
   */
  private teardownControls(removeOnWheel: boolean = true): void {
    if (this._onClick !== undefined) {
      this._inputHandler.off('click', this._onClick as PointerEventDelegate);
      this._onClick = undefined;
    }
    if (this._onWheel !== undefined && removeOnWheel) {
      this._domElement.removeEventListener('wheel', this._onWheel);
      this._onWheel = undefined;
    }
  }

  private handleMouseWheelActionChange(controlsOptions: CameraControlsOptions) {
    const { _controls: controls } = this;

    switch (controlsOptions?.mouseWheelAction) {
      case 'zoomToTarget':
        controls.zoomToCursor = false;
        break;
      case 'zoomPastCursor':
        controls.useScrollTarget = false;
        controls.zoomToCursor = true;
        break;
      case 'zoomToCursor':
        controls.setScrollTarget(controls.getState().target);
        controls.useScrollTarget = true;
        controls.zoomToCursor = true;
        break;
      case undefined:
        break;
      default:
        assertNever(controlsOptions.mouseWheelAction);
    }
  }
  /**
   * Method for setting up camera controls listeners and values inside current controls class.
   */
  private setupControls() {
    let scrollStarted = false;

    const wheelClock = new THREE.Clock();

    const onClick = async (e: any) => {
      this._controls.enableKeyboardNavigation = false;
      const newTarget = await this.calculateNewTarget(e);
      this.setCameraTarget(newTarget, true);
    };

    const onWheel = async (e: any) => {
      const timeDelta = wheelClock.getDelta();

      if (timeDelta > CameraManager.DefaultMinimalTimeBetweenRaycasts) scrollStarted = false;

      const wantNewScrollTarget = !scrollStarted && e.deltaY < 0;
      const isZoomToCursor = this._cameraControlsOptions.mouseWheelAction === 'zoomToCursor';

      if (wantNewScrollTarget && isZoomToCursor) {
        scrollStarted = true;
        const newTarget = await this.calculateNewTarget(e);
        this._controls.setScrollTarget(newTarget);
      }
    };

    if (this._controls) this.handleMouseWheelActionChange(this._cameraControlsOptions);

    if (this._cameraControlsOptions.changeCameraTargetOnClick && this._onClick === undefined) {
      this._inputHandler.on('click', onClick);
      this._onClick = onClick;
    }
    if (this._onWheel === undefined) {
      this._domElement.addEventListener('wheel', onWheel);
      this._onWheel = onWheel;
    }
  }

  /**
   * Convert pixel coordinates of the cursor to [-1,1]^2 coordinates.
   * @param pixelX
   * @param pixelY
   */
  private convertPixelCoordinatesToNormalized(pixelX: number, pixelY: number) {
    const x = (pixelX / this._domElement.clientWidth) * 2 - 1;
    const y = (pixelY / this._domElement.clientHeight) * -2 + 1;

    return { x, y };
  }

  private calculateDefaultDuration(distanceToCamera: number): number {
    let duration = distanceToCamera * 125; // 125ms per unit distance
    duration = Math.min(
      Math.max(duration, CameraManager.DefaultMinAnimationDuration),
      CameraManager.DefaultMaxAnimationDuration
    );

    return duration;
  }
}

function getBoundingBoxCorners(bbox: THREE.Box3, outBuffer?: THREE.Vector3[]): THREE.Vector3[] {
  outBuffer = outBuffer || range(0, 8).map(_ => new THREE.Vector3());
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
