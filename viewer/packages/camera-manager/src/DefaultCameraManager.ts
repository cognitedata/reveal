/*!
 * Copyright 2021 Cognite AS
 */

import { Plane, Vector3 } from 'three';
import * as THREE from 'three';
import TWEEN, { type Tween } from '@tweenjs/tween.js';
import clamp from 'lodash/clamp';

import { ComboControls } from './ComboControls';
import { ComboControlsOptions } from './ComboControlsOptions';

import {
  CameraManagerCallbackData,
  CameraState,
  CameraChangeDelegate,
  CameraManagerEventType,
  CameraStopDelegate,
  CameraEventDelegate,
  NearAndFarPlaneBuffers,
  CameraFarBuffers
} from './types';

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
  getPixelCoordinatesFromEvent
} from '@reveal/utilities';

import { DebouncedCameraStopEventTrigger } from './utils/DebouncedCameraStopEventTrigger';
import { getNormalizedPixelCoordinates } from '@reveal/utilities';
import { CameraControlsOptions } from './CameraControlsOptions';

type RaycastCallback = (x: number, y: number, pickBoundingBox: boolean) => Promise<CameraManagerCallbackData>;
/**
 * Default implementation of {@link CameraManager}. Uses target-based orbit controls combined with
 * keyboard and mouse navigation possibility. Supports automatic update of camera near and far
 * planes and animated change of camera position and target.
 */
export class DefaultCameraManager implements CameraManager {
  private readonly _events = {
    cameraChange: new EventTrigger<CameraChangeDelegate>()
  };

  private readonly _stopEventTrigger: DebouncedCameraStopEventTrigger;
  private readonly _controls: ComboControls;
  private readonly _camera: THREE.PerspectiveCamera;
  private readonly _domElement: HTMLElement;
  private readonly _inputHandler: InputHandler;
  private readonly _raycaster = new THREE.Raycaster();

  private _isDisposed = false;
  private _nearAndFarNeedsUpdate = false;

  /**
   * Reusable buffers used by updateNearAndFarPlane function to avoid allocations.
   */
  private readonly _updateNearAndFarPlaneBuffers: NearAndFarPlaneBuffers = {
    cameraPosition: new Vector3(),
    cameraDirection: new Vector3(),
    corners: new Array<Vector3>(
      new Vector3(),
      new Vector3(),
      new Vector3(),
      new Vector3(),
      new Vector3(),
      new Vector3(),
      new Vector3(),
      new Vector3()
    )
  };

  private readonly _calculateCameraFarBuffers: CameraFarBuffers = {
    nearPlaneCoplanarPoint: new Vector3(),
    nearPlane: new Plane()
  };

  // The active/inactive state of this manager. Does not always match up with the controls
  // as these are temporarily disabled to block onWheel input during `zoomToCursor`-mode
  private _isEnabled = true;

  private readonly _raycastCallback: RaycastCallback;
  private _onClick: ((event: PointerEvent) => void) | undefined = undefined;
  private _onDoubleClick: ((event: PointerEventData) => void) | undefined = undefined;
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
    changeCameraTargetOnClick: false,
    changeCameraPositionOnDoubleClick: false
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
    raycastCallback: RaycastCallback,
    camera?: THREE.PerspectiveCamera
  ) {
    this._camera = camera ?? new THREE.PerspectiveCamera(60, undefined, 0.1, 10000);

    this._domElement = domElement;
    this._inputHandler = inputHandler;
    this._raycastCallback = raycastCallback;

    this.setCameraControlsOptions(this._cameraControlsOptions);
    this._controls = new ComboControls(this._camera, domElement);
    this.setComboControlsOptions({ minZoomDistance: DefaultCameraManager.MinZoomDistance });

    this._controls.addEventListener('cameraChange', event => {
      const { position, target } = event.camera;
      this._events.cameraChange.fire(position.clone(), target.clone());
      this._nearAndFarNeedsUpdate = true;
    });

    this._stopEventTrigger = new DebouncedCameraStopEventTrigger(this);
  }

  on(event: CameraManagerEventType, callback: CameraEventDelegate): void {
    switch (event) {
      case 'cameraChange':
        this._events.cameraChange.subscribe(callback as CameraChangeDelegate);
        break;
      case 'cameraStop':
        this._stopEventTrigger.subscribe(callback as CameraStopDelegate);
        break;
      default:
        assertNever(event);
    }
  }

  off(event: CameraManagerEventType, callback: CameraEventDelegate): void {
    switch (event) {
      case 'cameraChange':
        this._events.cameraChange.unsubscribe(callback as CameraChangeDelegate);
        break;
      case 'cameraStop':
        this._stopEventTrigger.unsubscribe(callback as CameraStopDelegate);
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
   * Gets current Combo Controls options.
   */
  getComboControlsOptions(): Readonly<ComboControlsOptions> {
    return this._controls.options;
  }

  /**
   * Sets Combo Controls options.
   * Only provided options will be changed, any undefined options will be kept as is.
   */
  setComboControlsOptions(options: Partial<ComboControlsOptions>): void {
    this._controls.options = options;
  }

  /**
   * Sets whether keyboard control of the camera is enabled/disabled.
   */
  set keyboardNavigationEnabled(enabled: boolean) {
    this.setComboControlsOptions({ enableKeyboardNavigation: enabled });
  }

  /**
   * Whether keyboard control of the camera is enabled/disabled.
   */
  get keyboardNavigationEnabled(): boolean {
    return this.getComboControlsOptions().enableKeyboardNavigation;
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
    if (state.rotation && state.target) {
      throw new Error(`Rotation and target can't be set at the same time`);
    }
    const newPosition = state.position ?? this._camera.position;
    const newRotation = (state.target ? new THREE.Quaternion() : state.rotation) ?? new THREE.Quaternion();
    const newTarget =
      state.target ??
      (state.rotation
        ? CameraManagerHelper.calculateNewTargetFromRotation(
            this._camera,
            state.rotation,
            this._controls.getState().target,
            newPosition
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
    if (this._isEnabled) return;

    this._isEnabled = true;
    this.setCameraControlsOptions(this._cameraControlsOptions);
    this._controls.enabled = true;

    if (cameraManager) {
      const previousState = cameraManager.getCameraState();
      this.setCameraState({ position: previousState.position, target: previousState.target });
      this.getCamera().aspect = cameraManager.getCamera().aspect;
    }
  }

  deactivate(): void {
    if (!this._isEnabled) return;

    this._isEnabled = false;
    this._controls.enabled = false;
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

    if (this._isEnabled) {
      // New EventListeners are added in 'setupControls', so to avoid “doubling” of some behaviours we need to tear down controls first.
      this.teardownControls(false);
      this.setupControls();
    }
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
    this._isDisposed = true;
    this._controls.dispose();
    this.teardownControls();
    disposeOfAllEventListeners(this._events);
    this._inputHandler.dispose();
    this._stopEventTrigger.dispose();
  }

  private moveCameraTo(
    position: THREE.Vector3,
    target: THREE.Vector3,
    duration?: number,
    keyboardNavigationEnabled = true
  ): void {
    if (this._isDisposed) {
      return;
    }
    duration = duration ?? this.calculateDefaultDuration(target.distanceTo(this._camera.position));
    const startTarget = this.calculateAnimationStartTarget(target);
    const cameraPosition = this._camera.position;
    const from = {
      x: cameraPosition.x,
      y: cameraPosition.y,
      z: cameraPosition.z,
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
        if (this._isDisposed) {
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
        if (this._isDisposed) {
          return;
        }
        this.keyboardNavigationEnabled = keyboardNavigationEnabled;
        this._domElement.removeEventListener('pointerdown', stopTween);
        document.removeEventListener('keydown', stopTween);
      })
      .start(TWEEN.now());
    tween.update(TWEEN.now());
  }

  private moveCameraTargetTo(target: THREE.Vector3, duration?: number, keyboardNavigationEnabled = true): void {
    if (this._isDisposed) {
      return;
    }
    if (duration === 0) {
      this._controls.setState(this._controls.getState().position, target);
      return;
    }
    duration = duration ?? this.calculateDefaultDuration(target.distanceTo(this._camera.position));

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
        this.setComboControlsOptions({ lookAtViewTarget: true });
        this._controls.setState(this._camera.position, target);
      })
      .onUpdate(() => {
        if (this._isDisposed) {
          return;
        }
        tempTarget.set(from.targetX, from.targetY, from.targetZ);
        if (!this._camera) {
          return;
        }

        if (this._cameraControlsOptions.mouseWheelAction === 'zoomToCursor') {
          this._controls.setScrollTarget(tempTarget);
        }
        this._controls.setViewTarget(tempTarget);
      })
      .onStop(() => {
        this.setComboControlsOptions({ lookAtViewTarget: false });
        this._controls.setState(this._camera.position, tempTarget);
      })
      .onComplete(() => {
        if (this._isDisposed) {
          return;
        }
        this.setComboControlsOptions({ lookAtViewTarget: false });
        this.keyboardNavigationEnabled = keyboardNavigationEnabled;
        this._domElement.removeEventListener('pointerdown', stopTween);
        document.removeEventListener('keydown', stopTween);
      })
      .start(TWEEN.now());
    tween.update(TWEEN.now());
  }

  private updateCameraNearAndFar(camera: THREE.PerspectiveCamera, boundingBox: THREE.Box3): void {
    // See https://stackoverflow.com/questions/8101119/how-do-i-methodically-choose-the-near-clip-plane-distance-for-a-perspective-proj
    if (this._isDisposed) {
      return;
    }
    if (!this.automaticControlsSensitivity && !this.automaticNearFarPlane) {
      return;
    }
    if (this.automaticNearFarPlane) {
      CameraManagerHelper.updateCameraNearAndFar(
        camera,
        boundingBox,
        this._updateNearAndFarPlaneBuffers,
        this._calculateCameraFarBuffers
      );
    }
    if (this.automaticControlsSensitivity) {
      const diagonal = boundingBox.min.distanceTo(boundingBox.max);

      // This is used to determine the speed of the camera when flying with ASDW.
      // We want to either let it be controlled by the near plane if we are far away,
      // but no more than a fraction of the bounding box of the system if inside
      this.setComboControlsOptions({
        minDistance: Math.min(Math.max(diagonal * 0.02, 0.1 * camera.near), DefaultCameraManager.MinDistance)
      });
    }
  }

  private calculateAnimationStartTarget(newTarget: THREE.Vector3): THREE.Vector3 {
    this._raycaster.setFromCamera(new THREE.Vector2(), this._camera);
    const distanceToTarget = newTarget.distanceTo(this._camera.position);
    const scaledDirection = this._raycaster.ray.direction.clone().multiplyScalar(distanceToTarget);

    return this._raycaster.ray.origin.clone().add(scaledDirection);
  }

  private createTweenAnimation(
    from: any,
    to: any,
    duration: number
  ): { tween: Tween<any>; stopTween: (event: Event) => void } {
    const animation = new TWEEN.Tween(from);
    const stopTween = (event: Event) => {
      if (this._isDisposed) {
        document.removeEventListener('keydown', stopTween);
        animation.stop();
        return;
      }

      if (event.type !== 'keydown' || this.keyboardNavigationEnabled) {
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
  private calculateNewTargetWithoutModel(cursorPosition: THREE.Vector2, modelsBoundingBox: THREE.Box3): THREE.Vector3 {
    const modelSize = modelsBoundingBox.min.distanceTo(modelsBoundingBox.max);

    const lastScrollTargetDistance = this._controls.getScrollTarget().distanceTo(this._camera.position);

    const newTargetDistance =
      lastScrollTargetDistance <= this.getComboControlsOptions().minDistance
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
   * @param event PointerEvent that contains pointer location data.
   */
  private async calculateNewTarget(event: PointerEventData): Promise<THREE.Vector3> {
    const pixelCoordinates = getNormalizedPixelCoordinates(this._domElement, event.offsetX, event.offsetY);
    const raycastResult = await this._raycastCallback(event.offsetX, event.offsetY, false);

    const newTarget =
      raycastResult.intersection?.point ??
      this.calculateNewTargetWithoutModel(pixelCoordinates, raycastResult.modelsBoundingBox);

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
    if (this._onDoubleClick !== undefined) {
      this._domElement.removeEventListener('dblclick', this._onDoubleClick);
      this._onDoubleClick = undefined;
    }
    if (this._onWheel !== undefined && removeOnWheel) {
      this._domElement.removeEventListener('wheel', this._onWheel);
      this._onWheel = undefined;
    }
  }

  private handleMouseWheelActionChange(cameraControlsOptions: CameraControlsOptions) {
    switch (cameraControlsOptions?.mouseWheelAction) {
      case 'zoomToTarget':
        this.setComboControlsOptions({ zoomToCursor: false });
        break;
      case 'zoomPastCursor':
        this.setComboControlsOptions({ useScrollTarget: false });
        this.setComboControlsOptions({ zoomToCursor: true });
        break;
      case 'zoomToCursor':
        this._controls.setScrollTarget(this._controls.getState().target);
        this.setComboControlsOptions({ useScrollTarget: true });
        this.setComboControlsOptions({ zoomToCursor: true });
        break;
      case undefined:
        break;
      default:
        assertNever(cameraControlsOptions.mouseWheelAction);
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

    const onWheel = async (event: WheelEvent) => {
      // Added because cameraControls are disabled when doing picking, so
      // preventDefault could be not called on wheel event and produce unwanted scrolling.
      event.preventDefault();
      const position = getPixelCoordinatesFromEvent(event, this._domElement);

      const currentTime = performance.now();
      const currentMousePosition = position;

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
      const wantNewScrollTarget = !scrollStarted && event.deltaY < 0;

      lastMousePosition.copy(currentMousePosition);
      wasLastScrollZoomOut = event.deltaY > 0;
      lastWheelEventTime = currentTime;

      if (wantNewScrollTarget && isZoomToCursor) {
        scrollStarted = true;

        const pointerEventData = {
          offsetX: position.x,
          offsetY: position.y,
          button: event.button
        };

        const newTarget = await this.calculateNewTarget(pointerEventData);
        this._controls.setScrollTarget(newTarget);
      }
    };

    if (this._controls) {
      this.handleMouseWheelActionChange(this._cameraControlsOptions);
    }
    if (this._cameraControlsOptions.changeCameraTargetOnClick && this._onClick === undefined) {
      this._inputHandler.on('click', this.onClick);
      this._onClick = this.onClick;
    }
    if (this._cameraControlsOptions.changeCameraPositionOnDoubleClick && this._onDoubleClick === undefined) {
      this._domElement.addEventListener('dblclick', this.onDoubleClick);
      this._onDoubleClick = this.onDoubleClick;
    }
    if (this._onWheel === undefined) {
      this._domElement.addEventListener('wheel', onWheel);
      this._onWheel = onWheel;
    }
  }

  private readonly onClick = async (event: PointerEventData) => {
    const keyboardNavigationEnabled = this.keyboardNavigationEnabled;
    this.keyboardNavigationEnabled = false;
    const newTarget = await this.calculateNewTarget(event);
    this.moveCameraTargetTo(newTarget, DefaultCameraManager.AnimationDuration, keyboardNavigationEnabled);
  };

  private readonly onDoubleClick = async (event: PointerEventData) => {
    const keyboardNavigationEnabled = this.keyboardNavigationEnabled;
    this.keyboardNavigationEnabled = false;

    const pixelCoordinates = getNormalizedPixelCoordinates(this._domElement, event.offsetX, event.offsetY);
    const modelRaycastData = await this._raycastCallback(event.offsetX, event.offsetY, true);

    // If an object is picked, zoom in to the object (the target will be in the middle of the bounding box)
    if (modelRaycastData.pickedBoundingBox !== undefined) {
      const { position, target } = fitCameraToBoundingBox(this._camera, modelRaycastData.pickedBoundingBox);
      this.moveCameraTo(position, target, DefaultCameraManager.AnimationDuration, keyboardNavigationEnabled);
      return;
    }
    // If not particular object is picked, set camera position half way to the target
    const newTarget =
      modelRaycastData.intersection?.point ??
      this.calculateNewTargetWithoutModel(pixelCoordinates, modelRaycastData.modelsBoundingBox);

    const newPosition = new THREE.Vector3().subVectors(newTarget, this._camera.position);
    newPosition.divideScalar(2);
    newPosition.add(this._camera.position);
    this.moveCameraTo(newPosition, newTarget, DefaultCameraManager.AnimationDuration, keyboardNavigationEnabled);
  };
  private calculateDefaultDuration(distanceToCamera: number): number {
    const duration = distanceToCamera * 125; // 125ms per unit distance
    return clamp(duration, DefaultCameraManager.MinAnimationDuration, DefaultCameraManager.MaxAnimationDuration);
  }
}
