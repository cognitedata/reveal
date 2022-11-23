/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';
import { ComboControls } from './ComboControls';
import { CameraManagerCallbackData, CameraControlsOptions, CameraState, CameraChangeDelegate } from './types';
import { CameraManager } from './CameraManager';
import { CameraManagerHelper } from './CameraManagerHelper';
import {
  assertNever,
  EventTrigger,
  InputHandler,
  disposeOfAllEventListeners,
  PointerEventDelegate,
  PointerEventData,
  fitCameraToBoundingBox,
  clickOrTouchEventOffset
} from '@reveal/utilities';

/**
 * Default implementation of {@link CameraManager}. Uses target-based orbit controls combined with
 * keyboard and mouse navigation possibility. Supports automatic update of camera near and far
 * planes and animated change of camera position and target.
 */
export class DefaultCameraManager implements CameraManager {
  private readonly _events = {
    cameraChange: new EventTrigger<CameraChangeDelegate>()
  };

  private readonly _controls: ComboControls;
  private readonly _camera: THREE.PerspectiveCamera;
  private readonly _domElement: HTMLElement;
  private readonly _inputHandler: InputHandler;
  private readonly _raycaster = new THREE.Raycaster();

  private isDisposed = false;
  private _nearAndFarNeedsUpdate = false;
  // Used by onWheel() to temporarily disable (and reset enabled flag) during pick operations when in `zoomToCursor` -mode
  private _enabledCopy = true;

  private readonly _modelRaycastCallback: (x: number, y: number) => Promise<CameraManagerCallbackData>;
  private _onClick: ((event: MouseEvent) => void) | undefined = undefined;
  private _onWheel: ((event: WheelEvent) => void) | undefined = undefined;

  private static readonly AnimationDuration = 300;
  private static readonly MinAnimationDuration = 300;
  private static readonly MaxAnimationDuration = 1250;
  private static readonly MinDistance = 0.8;
  private static readonly MinZoomDistance = 0.4;
  private static readonly MinimalTimeBetweenRaycasts = 120;
  private static readonly MaximumTimeBetweenRaycasts = 200;
  private static readonly MouseDistanceThresholdBetweenRaycasts = 5;
  private static readonly DefaultCameraControlsOptions: Required<CameraControlsOptions> = {
    mouseWheelAction: 'zoomPastCursor',
    changeCameraTargetOnClick: false
  };

  private _cameraControlsOptions: Required<CameraControlsOptions> = {
    ...DefaultCameraManager.DefaultCameraControlsOptions
  };
  private readonly _currentBoundingBox: THREE.Box3 = new THREE.Box3();
  /**
   * When false, camera near and far planes will not be updated automatically (defaults to true).
   * This can be useful when you have custom content in the 3D view and need to better
   * control the view frustum.
   *
   * When automatic camera near/far planes are disabled, you are responsible for setting
   * this on your own.
   * @example
   * ```
   * viewer.camera.near = 0.1;
   * viewer.camera.far = 1000.0;
   * viewer.camera.updateProjectionMatrix();
   * ```
   */
  public automaticNearFarPlane = true;
  /**
   * When false, the sensitivity of the camera controls will not be updated automatically.
   * This can be useful to better control the sensitivity of the 3D navigation.
   *
   * When not set, control the sensitivity of the camera using `viewer.cameraManager.cameraControls.minDistance`
   * and `viewer.cameraManager.cameraControls.maxDistance`.
   */
  public automaticControlsSensitivity = true;

  /**
   * @internal
   */
  constructor(
    domElement: HTMLElement,
    inputHandler: InputHandler,
    raycastFunction: (x: number, y: number) => Promise<CameraManagerCallbackData>,
    camera?: THREE.PerspectiveCamera
  ) {
    this._camera = camera ?? new THREE.PerspectiveCamera(60, undefined, 0.1, 10000);

    this._domElement = domElement;
    this._inputHandler = inputHandler;
    this._modelRaycastCallback = raycastFunction;

    this.setCameraControlsOptions(this._cameraControlsOptions);
    this._controls = new ComboControls(this._camera, domElement);
    this._controls.minZoomDistance = DefaultCameraManager.MinZoomDistance;

    this._controls.addEventListener('cameraChange', event => {
      const { position, target } = event.camera;
      this._events.cameraChange.fire(position.clone(), target.clone());
      this._nearAndFarNeedsUpdate = true;
    });
  }

  on(event: 'cameraChange', callback: CameraChangeDelegate): void {
    switch (event) {
      case 'cameraChange':
        this._events.cameraChange.subscribe(callback as CameraChangeDelegate);
        break;
      default:
        assertNever(event);
    }
  }

  off(event: 'cameraChange', callback: CameraChangeDelegate): void {
    switch (event) {
      case 'cameraChange':
        this._events.cameraChange.subscribe(callback as CameraChangeDelegate);
        break;
      default:
        assertNever(event);
    }
  }

  fitCameraToBoundingBox(box: THREE.Box3, duration?: number, radiusFactor: number = 2): void {
    const { position, target } = fitCameraToBoundingBox(this._camera, box, radiusFactor);

    this.moveCameraTo(position, target, duration);
  }

  /**
   * Gets instance of camera controls that are used by camera manager. See {@link ComboControls} for more
   * information on all adjustable properties.
   * @deprecated Will be removed in 4.0.0.
   */
  get cameraControls(): ComboControls {
    return this._controls;
  }

  /**
   * Sets whether camera controls through mouse, touch and keyboard are enabled.
   */
  set enabled(enabled: boolean) {
    this._controls.enabled = enabled;
    this._enabledCopy = enabled;
  }

  /**
   * Gets whether camera controls through mouse, touch and keyboard are enabled.
   */
  get enabled(): boolean {
    return this._controls.enabled;
  }

  /**
   * Sets whether keyboard control of the camera is enabled/disabled.
   */
  set keyboardNavigationEnabled(enabled: boolean) {
    this._controls.enableKeyboardNavigation = enabled;
  }

  /**
   * Whether keyboard control of the camera is enabled/disabled.
   */
  get keyboardNavigationEnabled(): boolean {
    return this._controls.enableKeyboardNavigation;
  }

  getCamera(): THREE.PerspectiveCamera {
    return this._camera;
  }

  /**
   * Sets camera state. All parameters are optional. Rotation and target can't be set at the same time,
   * if so, error will be thrown. Set rotation is preserved until next call of setCameraState with
   * empty rotation field.
   * @param state Camera state.
   * **/
  setCameraState(state: CameraState): void {
    if (state.rotation && state.target) throw new Error(`Rotation and target can't be set at the same time`);

    const newPosition = state.position ?? this._camera.position;
    const newRotation = (state.target ? new THREE.Quaternion() : state.rotation) ?? new THREE.Quaternion();
    const newTarget =
      state.target ??
      (state.rotation
        ? CameraManagerHelper.calculateNewTargetFromRotation(
            this._camera,
            state.rotation,
            this._controls.getState().target
          )
        : this._controls.getState().target);

    this._controls.cameraRawRotation.copy(newRotation);

    this._controls.setState(newPosition, newTarget);
  }

  getCameraState(): Required<CameraState> {
    return {
      position: this._camera.position.clone(),
      rotation: this._camera.quaternion.clone(),
      target: this._controls.getState().target.clone()
    };
  }

  activate(cameraManager?: CameraManager): void {
    if (cameraManager) {
      const previousState = cameraManager.getCameraState();
      this.setCameraState({ position: previousState.position, target: previousState.target });
      this.getCamera().aspect = cameraManager.getCamera().aspect;
    }

    this.enabled = true;
    this.teardownControls(false);
    this.setupControls();
  }

  deactivate(): void {
    this.enabled = false;
    this.teardownControls(true);
  }

  /**
   * Gets current camera controls options.
   */
  getCameraControlsOptions(): CameraControlsOptions {
    return this._cameraControlsOptions;
  }

  /**
   * Sets camera controls options to customize camera controls modes. See {@link CameraControlsOptions}.
   * @param controlsOptions JSON object with camera controls options.
   */
  setCameraControlsOptions(controlsOptions: CameraControlsOptions): void {
    this._cameraControlsOptions = { ...DefaultCameraManager.DefaultCameraControlsOptions, ...controlsOptions };

    this.teardownControls(false);
    this.setupControls();
  }

  update(deltaTime: number, boundingBox: THREE.Box3): void {
    if (this._nearAndFarNeedsUpdate || !boundingBox.equals(this._currentBoundingBox)) {
      this.updateCameraNearAndFar(this._camera, boundingBox);
      this._nearAndFarNeedsUpdate = false;
      this._currentBoundingBox.copy(boundingBox);
    }

    this._controls.update(deltaTime);
  }

  dispose(): void {
    this.isDisposed = true;
    this._controls.dispose();
    this.teardownControls();
    disposeOfAllEventListeners(this._events);
    this._inputHandler.dispose();
  }

  private moveCameraTo(position: THREE.Vector3, target: THREE.Vector3, duration?: number): void {
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

  private moveCameraTargetTo(target: THREE.Vector3, duration?: number): void {
    if (this.isDisposed) {
      return;
    }

    if (duration === 0) {
      this._controls.setState(this._controls.getState().position, target);
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

        this._domElement.removeEventListener('pointerdown', stopTween);
      })
      .start(TWEEN.now());
    tween.update(TWEEN.now());
  }

  private updateCameraNearAndFar(camera: THREE.PerspectiveCamera, combinedBbox: THREE.Box3): void {
    // See https://stackoverflow.com/questions/8101119/how-do-i-methodically-choose-the-near-clip-plane-distance-for-a-perspective-proj
    if (this.isDisposed) {
      return;
    }
    if (!this.automaticControlsSensitivity && !this.automaticNearFarPlane) {
      return;
    }

    // Apply
    if (this.automaticNearFarPlane) {
      CameraManagerHelper.updateCameraNearAndFar(camera, combinedBbox);
    }
    if (this.automaticControlsSensitivity) {
      const diagonal = combinedBbox.min.distanceTo(combinedBbox.max);

      // This is used to determine the speed of the camera when flying with ASDW.
      // We want to either let it be controlled by the near plane if we are far away,
      // but no more than a fraction of the bounding box of the system if inside
      this._controls.minDistance = Math.min(
        Math.max(diagonal * 0.02, 0.1 * camera.near),
        DefaultCameraManager.MinDistance
      );
    }
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

    const lastScrollTargetDistance = this._controls.getScrollTarget().distanceTo(this._camera.position);

    const newTargetDistance =
      lastScrollTargetDistance <= this._controls.minDistance
        ? Math.min(this._camera.position.distanceTo(modelsBoundingBox.getCenter(new THREE.Vector3())), modelSize) / 2
        : lastScrollTargetDistance;

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
  private async calculateNewTarget(event: PointerEventData): Promise<THREE.Vector3> {
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
    let wasLastScrollZoomOut = false;

    let lastWheelEventTime = 0;

    const lastMousePosition = new THREE.Vector2();

    const onClick = async (e: PointerEventData) => {
      this._controls.enableKeyboardNavigation = false;
      const newTarget = await this.calculateNewTarget(e);
      this.moveCameraTargetTo(newTarget, DefaultCameraManager.AnimationDuration);
    };

    const onWheel = async (e: WheelEvent) => {
      // Added because cameraControls are disabled when doing picking, so
      // preventDefault could be not called on wheel event and produce unwanted scrolling.
      e.preventDefault();
      const domElementRelativeOffset = clickOrTouchEventOffset(e, this._domElement);

      const currentTime = performance.now();
      const currentMousePosition = new THREE.Vector2(
        domElementRelativeOffset.offsetX,
        domElementRelativeOffset.offsetY
      );

      const onWheelTimeDelta = currentTime - lastWheelEventTime;

      const mouseDelta = currentMousePosition.distanceTo(lastMousePosition);
      const timeSinceLastPickingTookTooLong = onWheelTimeDelta > DefaultCameraManager.MaximumTimeBetweenRaycasts;

      if (onWheelTimeDelta > DefaultCameraManager.MinimalTimeBetweenRaycasts) scrollStarted = false;

      if (
        !wasLastScrollZoomOut &&
        timeSinceLastPickingTookTooLong &&
        mouseDelta < DefaultCameraManager.MouseDistanceThresholdBetweenRaycasts
      )
        scrollStarted = true;

      const isZoomToCursor = this._cameraControlsOptions.mouseWheelAction === 'zoomToCursor';
      const wantNewScrollTarget = !scrollStarted && e.deltaY < 0;

      lastMousePosition.copy(currentMousePosition);
      wasLastScrollZoomOut = e.deltaY > 0;
      lastWheelEventTime = currentTime;

      if (wantNewScrollTarget && isZoomToCursor) {
        scrollStarted = true;
        let newTarget: THREE.Vector3;

        // Disable controls to prevent camera from moving while picking is happening.
        // await is not working as expected because event itself is not awaited.
        try {
          this._controls.enabled = false;
          const pointerEventData = {
            offsetX: domElementRelativeOffset.offsetX,
            offsetY: domElementRelativeOffset.offsetY,
            button: e.button
          };

          newTarget = await this.calculateNewTarget(pointerEventData);
        } finally {
          this._controls.enabled = this._enabledCopy;
        }

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
      Math.max(duration, DefaultCameraManager.MinAnimationDuration),
      DefaultCameraManager.MaxAnimationDuration
    );

    return duration;
  }
}
