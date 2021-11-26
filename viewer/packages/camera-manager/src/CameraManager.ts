/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';
import { ComboControls } from './ComboControls';
import { CallbackData, CameraControlsOptions, CameraChangeData, PointerEventDelegate } from './types';
import { assertNever, EventTrigger, MouseHandler, } from '@reveal/utilities';

export class CameraManager {
  public readonly controls: ComboControls;

  private readonly _events = {
    cameraChange: new EventTrigger<CameraChangeData>(),
  };

  private readonly _camera: THREE.PerspectiveCamera;
  private readonly _domElement: HTMLElement;
  private readonly _mouseHandler: MouseHandler;

  private readonly _modelRaycastCallback: (x: number, y: number) => Promise<CallbackData>;

  private static readonly DefaultAnimationDuration: number = 600;
  private static readonly DefaultMinAnimationDuration: number = 600;
  private static readonly DefaultMaxAnimationDuration: number = 2500;
  private static readonly DefaultMinDistance: number = 0.1;
  private static readonly DefaultCameraControlsOptions: Required<CameraControlsOptions> = {
    mouseWheelAction: 'zoomPastCursor',
    onClickTargetChange: false
  };

  private _cameraControlsOptions: Required<CameraControlsOptions> = { ...CameraManager.DefaultCameraControlsOptions };
  
  public automaticNearFarPlane: boolean = true;
  public automaticControlsSensitivity = false;

  private isDisposed = false;
  private readonly _raycaster: THREE.Raycaster = new THREE.Raycaster();
  private _onClick: ((event: MouseEvent) => void) | undefined = undefined;
  private _onWheel: ((event: MouseEvent) => void) | undefined = undefined;

  /**
   * Reusable buffers used by functions in Cognite3dViewer to avoid allocations.
   */
  private readonly _updateNearAndFarPlaneBuffers = {
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
   * Convert pixel coordinates of the cursor to [-1,1]^2 coordinates.
   * @param pixelX
   * @param pixelY
   */
  private convertPixelCoordinatesToNormalized(pixelX: number, pixelY: number) {
    const x = (pixelX / this._domElement.clientWidth) * 2 - 1;
    const y = (pixelY / this._domElement.clientHeight) * -2 + 1;

    return { x, y };
  }

  /**
   * Calculates new target when raycaster doesn't have any intersections with the model.
   * @param cursorPosition Cursor position for desired calculations.
   * @param cursorPosition.x
   * @param cursorPosition.y
   */
  private calculateMissedRaycast(
    cursorPosition: { x: number; y: number },
    modelsBoundingBox: THREE.Box3
  ): THREE.Vector3 {
    const modelSize = modelsBoundingBox.min.distanceTo(modelsBoundingBox.max);

    this._raycaster.setFromCamera(cursorPosition, this._camera);

    const farPoint = this._raycaster.ray.direction
      .clone()
      .normalize()
      .multiplyScalar(
        Math.max(this._camera.position.distanceTo(modelsBoundingBox.getCenter(new THREE.Vector3())), modelSize)
      )
      .add(this._camera.position);

    return farPoint;
  }

  /**
   * Changes controls target based on current cursor position.
   * @param event MouseEvent that contains pointer location data.
   */
  private async changeTarget(event: MouseEvent) {
    const { offsetX, offsetY } = event;

    const { x, y } = this.convertPixelCoordinatesToNormalized(offsetX, offsetY);

    const callbackData = await this._modelRaycastCallback(offsetX, offsetY);

    const newTarget =
      callbackData?.intersection?.point ?? this.calculateMissedRaycast({ x, y }, callbackData.modelsBoundingBox);

    this.setCameraTarget(newTarget, true);
  }

  /**
   * Changes controls scroll target based on current cursor position.
   * @param event MouseEvent that contains pointer location data.
   */
  private async changeScrollTarget(event: MouseEvent) {
    const { offsetX, offsetY } = event;
    const { x, y } = this.convertPixelCoordinatesToNormalized(offsetX, offsetY);

    const callbackData = await this._modelRaycastCallback(offsetX, offsetY);

    const newScrollTarget =
      callbackData?.intersection?.point ?? this.calculateMissedRaycast({ x, y }, callbackData.modelsBoundingBox);

    this.controls.setScrollTarget(newScrollTarget);
  }

  /**
   * Removes controls event listeners if they are defined.
   */
  private teardownControls() {
    if (this._onClick !== undefined) {
      this._mouseHandler.off('click', this._onClick as PointerEventDelegate);
      this._onClick = undefined;
    }
    if (this._onWheel !== undefined) {
      this._domElement.removeEventListener('wheel', this._onWheel);
      this._onWheel = undefined;
    }
  }

  /**
   * Method for setting up camera controls listeners and values inside current controls class.
   */
  private setupControls() {
    let startedScroll = false;

    const wheelClock = new THREE.Clock();

    const onClick = (e: any) => {
      this.controls.enableKeyboardNavigation = false;
      this.changeTarget(e);
    };

    const onWheel = async (e: any) => {
      const timeDelta = wheelClock.getDelta();

      const wantNewScrollTarget = startedScroll && e.deltaY < 0;

      if (wantNewScrollTarget) {
        startedScroll = false;

        this.changeScrollTarget(e);
      } else if (timeDelta > 0.1) {
        startedScroll = true;
      }
    };

    switch (this._cameraControlsOptions.mouseWheelAction) {
      case 'zoomToTarget':
        this.controls.zoomToCursor = false;
        break;

      case 'zoomPastCursor':
        this.controls.useScrollTarget = false;
        this.controls.zoomToCursor = true;

        break;
      case 'zoomToCursor':
        this.controls.setScrollTarget(this.controls.getState().target);
        this.controls.useScrollTarget = true;
        this.controls.zoomToCursor = true;
        break;

      default:
        assertNever(this._cameraControlsOptions.mouseWheelAction);
    }

    if (this._cameraControlsOptions.onClickTargetChange) {
      this._mouseHandler.on('click', onClick);
      this._onClick = onClick;
    }
    if (this._cameraControlsOptions.mouseWheelAction === 'zoomToCursor') {
      this._domElement.addEventListener('wheel', onWheel);
      this._onWheel = onWheel;
    }
  }

  constructor(
    camera: THREE.PerspectiveCamera,
    domElement: HTMLElement,
    raycastFunction: (x: number, y: number) => Promise<CallbackData>
  ) {
    this._camera = camera;
    this._domElement = domElement;
    this._mouseHandler = new MouseHandler(domElement);
    this._modelRaycastCallback = raycastFunction;
    this.controls = new ComboControls(camera, domElement);
    this.controls.dollyFactor = 0.992;
    this.controls.minDistance = 0.15;
    this.controls.maxDistance = 100.0;

    this.setCameraControlsOptions(this._cameraControlsOptions);

    this.controls.addEventListener('cameraChange', event => {
      const { position, target } = event.camera;
      this._events.cameraChange.fire({camera: {position: position.clone(), target: target.clone()}});
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

  on(
    event: 'cameraChange',
    callback: CameraChangeData
  ): void {
    switch (event) {
      case 'cameraChange':
        this._events.cameraChange.subscribe(callback as CameraChangeData);
        break;
      default:
        assertNever(event);
    }
  }

  off(
    event: 'cameraChange',
    callback: CameraChangeData
  ): void {
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

  getCameraControlsOptions(): CameraControlsOptions {
    return this._cameraControlsOptions;
  }

  setCameraControlsOptions(controlsOptions: CameraControlsOptions) {
    this._cameraControlsOptions = { ...CameraManager.DefaultCameraControlsOptions, ...controlsOptions };

    this.teardownControls();
    this.setupControls();
  }

  setCameraTarget(target: THREE.Vector3, animated: boolean = false): void {
    if (this.isDisposed) {
      return;
    }

    const animationTime = animated ? CameraManager.DefaultAnimationDuration : 0;
    this.moveCameraTargetTo(target, animationTime);
  }

  private calculateDefaultDuration(distanceToCamera: number): number {
    let duration = distanceToCamera * 125; // 125ms per unit distance
    duration = Math.min(Math.max(duration, CameraManager.DefaultMinAnimationDuration), CameraManager.DefaultMaxAnimationDuration);

    return duration;
  }

  public moveCameraTo(position: THREE.Vector3, target: THREE.Vector3, duration?: number) {
    const { _camera, _raycaster } = this;

    duration = duration ?? this.calculateDefaultDuration(target.distanceTo(_camera.position));

    _raycaster.setFromCamera(new THREE.Vector2(), _camera);
    const distanceToTarget = target.distanceTo(_camera.position);
    const scaledDirection = _raycaster.ray.direction.clone().multiplyScalar(distanceToTarget);
    const startTarget = _raycaster.ray.origin.clone().add(scaledDirection);
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

    const animation = new TWEEN.Tween(from);
    const stopTween = (event: Event) => {
      if (this.isDisposed) {
        document.removeEventListener('keydown', stopTween);
        animation.stop();
        return;
      }

      if (event.type !== 'keydown' || this.controls.enableKeyboardNavigation) {
        animation.stop();
        this._domElement.removeEventListener('pointerdown', stopTween);
        this._domElement.removeEventListener('wheel', stopTween);
        document.removeEventListener('keydown', stopTween);
      }
    };

    this._domElement.addEventListener('pointerdown', stopTween);
    this._domElement.addEventListener('wheel', stopTween);
    document.addEventListener('keydown', stopTween);

    const tempTarget = new THREE.Vector3();
    const tempPosition = new THREE.Vector3();
    const tween = animation
      .to(to, duration)
      .easing((x: number) => TWEEN.Easing.Circular.Out(x))
      .onUpdate(() => {
        if (this.isDisposed) {
          return;
        }
        tempPosition.set(from.x, from.y, from.z);
        tempTarget.set(from.targetX, from.targetY, from.targetZ);
        if (!this._camera) {
          return;
        }

        this.controls.setState(tempPosition, tempTarget);
      })
      .onStop(() => {
        this.controls.setState(tempPosition, tempTarget);
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

  public moveCameraTargetTo(target: THREE.Vector3, duration?: number) {
    if (this.isDisposed) {
      return;
    }

    if (duration === 0) {
      this.controls.setState(this._camera.position, target);
      return;
    }

    const { _camera, _raycaster } = this;

    duration = duration ?? this.calculateDefaultDuration(target.distanceTo(_camera.position));

    _raycaster.setFromCamera(new THREE.Vector2(), _camera);
    const distanceToTarget = target.distanceTo(_camera.position);
    const scaledDirection = _raycaster.ray.direction.clone().multiplyScalar(distanceToTarget);
    const startTarget = _raycaster.ray.origin.clone().add(scaledDirection);
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

    const animation = new TWEEN.Tween(from);
    const stopTween = (event: Event) => {
      if (this.isDisposed) {
        document.removeEventListener('keydown', stopTween);
        animation.stop();
        return;
      }
      if (event.type !== 'keydown' || this.controls.enableKeyboardNavigation) {
        animation.stop();
        this._domElement.removeEventListener('pointerdown', stopTween);
        this._domElement.removeEventListener('wheel', stopTween);
        document.removeEventListener('keydown', stopTween);
      }
    };

    this._domElement.addEventListener('pointerdown', stopTween);
    this._domElement.addEventListener('wheel', stopTween);
    document.addEventListener('keydown', stopTween);

    const tempTarget = new THREE.Vector3();
    const tween = animation
      .to(to, duration)
      .easing((x: number) => TWEEN.Easing.Circular.Out(x))
      .onStart(() => {
        this.controls.lookAtViewTarget = true;
        this.controls.setState(this._camera.position, target);
      })
      .onUpdate(() => {
        if (this.isDisposed) {
          return;
        }
        tempTarget.set(from.targetX, from.targetY, from.targetZ);
        if (!this._camera) {
          return;
        }

        if (this._cameraControlsOptions.mouseWheelAction === 'zoomToCursor') this.controls.setScrollTarget(tempTarget);
        this.controls.setViewTarget(tempTarget);
      })
      .onStop(() => {
        this.controls.lookAtViewTarget = false;

        this.controls.setState(this._camera.position, tempTarget);
      })
      .onComplete(() => {
        if (this.isDisposed) {
          return;
        }
        this.controls.lookAtViewTarget = false;
        this.controls.enableKeyboardNavigation = true;
        this.controls.setState(this._camera.position, tempTarget);

        this._domElement.removeEventListener('pointerdown', stopTween);
      })
      .start(TWEEN.now());
    tween.update(TWEEN.now());
  }

  public updateCameraNearAndFar(camera: THREE.PerspectiveCamera, combinedBbox: THREE.Box3) {
    // See https://stackoverflow.com/questions/8101119/how-do-i-methodically-choose-the-near-clip-plane-distance-for-a-perspective-proj
    if (this.isDisposed) {
      return;
    }
    if (!this.automaticControlsSensitivity && !this.automaticNearFarPlane) {
      return;
    }

    const { cameraPosition, cameraDirection, corners, nearPlane, nearPlaneCoplanarPoint } =
      this._updateNearAndFarPlaneBuffers;
    getBoundingBoxCorners(combinedBbox, corners);
    camera.getWorldPosition(cameraPosition);
    camera.getWorldDirection(cameraDirection);

    // 1. Compute nearest to fit the whole bbox (the case
    // where the camera is inside the box is ignored for now)
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
      this.controls.minDistance = Math.min(Math.max(diagonal * 0.02, 0.1 * near), CameraManager.DefaultMinDistance);
    }
  }

  dispose(): void {
    this.isDisposed = true;
    this.controls.dispose();
    this.teardownControls();
  }
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
