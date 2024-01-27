/*!
 * Copyright 2021 Cognite AS
 */

import {
  Box3,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Quaternion,
  Raycaster,
  SphereGeometry,
  Vector2,
  Vector3
} from 'three';
import TWEEN from '@tweenjs/tween.js';
import clamp from 'lodash/clamp';

import { ComboControls } from './ComboControls';
import { ComboControlsOptions } from './ComboControlsOptions';

import {
  CameraManagerCallbackData,
  CameraState,
  CameraChangeDelegate,
  CameraManagerEventType,
  CameraStopDelegate,
  CameraEventDelegate
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
  clickOrTouchEventOffset
} from '@reveal/utilities';

import { DebouncedCameraStopEventTrigger } from './utils/DebouncedCameraStopEventTrigger';
import { getNormalizedPixelCoordinates } from '@reveal/utilities';
import { CameraControlsOptions } from './CameraControlsOptions';
import { ControlsType } from './Flexible/ControlsType';

/**
 * Default implementation of {@link CameraManager}. Uses target-based orbit controls combined with
 * keyboard and mouse navigation possibility. Supports automatic update of camera near and far
 * planes and animated change of camera position and target.
 */
export class DefaultCameraManager implements CameraManager {
  //================================================
  // CONSTANTS
  //================================================
  private static readonly AnimationDuration = 300;
  private static readonly MaximumMinDistance = 0.8; // For ComboColntrol.option.minDistance
  private static readonly MinZoomDistance = 0.4;
  private static readonly MinimalTimeBetweenRaycasts = 120;
  private static readonly MaximumTimeBetweenRaycasts = 200;
  private static readonly MouseDistanceThresholdBetweenRaycasts = 5;
  private static readonly DefaultCameraControlsOptions: Required<CameraControlsOptions> = {
    mouseWheelAction: 'zoomPastCursor',
    changeCameraTargetOnClick: false,
    changeTargetOnlyOnClick: false,
    changeCameraPositionOnDoubleClick: false,
    controlsType: ControlsType.Combo,
    showTarget: false,
    showLookAt: false
  };

  //================================================
  // INSTANCE FIELDS: Public
  //================================================

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

  //================================================
  // INSTANCE FIELDS: Private
  //================================================

  private readonly _events = { cameraChange: new EventTrigger<CameraChangeDelegate>() };
  private readonly _stopEventTrigger: DebouncedCameraStopEventTrigger;
  private readonly _controls: ComboControls;
  private readonly _camera: THREE.PerspectiveCamera;
  private readonly _domElement: HTMLElement;
  private readonly _inputHandler: InputHandler;
  private readonly _scene?: undefined | THREE.Scene;
  private _targetObject: THREE.Mesh | undefined;
  private _lookAtObject: THREE.Mesh | undefined;

  private _isDisposed = false;
  private _nearAndFarNeedsUpdate = false;

  // The active/inactive state of this manager. Does not always match up with the controls
  // as these are temporarily disabled to block onWheel input during `zoomToCursor`-mode
  private _isEnabled = true;

  private _cameraControlsOptions: Required<CameraControlsOptions> = {
    ...DefaultCameraManager.DefaultCameraControlsOptions
  };

  private readonly _currentBoundingBox: Box3 = new Box3();

  //================================================
  // INSTANCE FIELDS: Events
  //================================================

  private _onClick: ((event: PointerEvent) => void) | undefined = undefined;
  private _onWheel: ((event: WheelEvent) => void) | undefined = undefined;
  private _onDoubleClick: ((event: PointerEventData) => void) | undefined = undefined;

  private readonly _modelRaycastCallback: (
    x: number,
    y: number,
    pickBoundingBox: boolean
  ) => Promise<CameraManagerCallbackData>;

  //================================================
  // CONSTRUCTOR
  //================================================

  constructor(
    domElement: HTMLElement,
    inputHandler: InputHandler,
    raycastFunction: (x: number, y: number, pickBoundingBox: boolean) => Promise<CameraManagerCallbackData>,
    camera?: THREE.PerspectiveCamera,
    scene?: THREE.Scene
  ) {
    this._camera = camera ?? new PerspectiveCamera(60, undefined, 0.1, 10000);
    this._scene = scene;
    this._domElement = domElement;
    this._inputHandler = inputHandler;
    this._modelRaycastCallback = raycastFunction;

    this._controls = new ComboControls(this._camera, domElement);
    this.setCameraControlsOptions(this._cameraControlsOptions);
    this.setComboControlsOptions({ minZoomDistance: DefaultCameraManager.MinZoomDistance });

    this._controls.addEventListener('cameraChange', event => {
      const { position, target } = event.camera;
      this._events.cameraChange.fire(position.clone(), target.clone());
      this._nearAndFarNeedsUpdate = true;
      this.updateVisibleObjects();
    });

    this.isEnabled = true;
    this._stopEventTrigger = new DebouncedCameraStopEventTrigger(this);
  }

  //================================================
  // IMPLEMENTATION OF CameraManager (In correct order)
  //================================================

  public getCamera(): THREE.PerspectiveCamera {
    return this._camera;
  }

  public getCameraState(): Required<CameraState> {
    return {
      position: this.getPosition(),
      rotation: this._camera.quaternion.clone(),
      target: this.getTarget()
    };
  }

  /**
   * Sets camera state. All parameters are optional. Rotation and target can't be set at the same time,
   * if so, error will be thrown. Set rotation is preserved until next call of setCameraState with
   * empty rotation field.
   * @param state Camera state.
   * **/
  public setCameraState(state: CameraState): void {
    if (state.rotation && state.target) {
      throw new Error(`Rotation and target can't be set at the same time`);
    }
    const newPosition = state.position ?? this.getPosition();
    const newRotation = (state.target ? new Quaternion() : state.rotation) ?? new Quaternion();
    const newTarget =
      state.target ??
      (state.rotation
        ? CameraManagerHelper.calculateNewTargetFromRotation(
            this._camera,
            state.rotation,
            this.getTarget(),
            newPosition
          )
        : this.getTarget());

    if (this._controls.enabled) {
      this._controls.cameraRawRotation.copy(newRotation);
    }
    this.setPositionAndTarget(newPosition, newTarget);
  }

  public activate(cameraManager?: CameraManager): void {
    if (this.isEnabled) {
      return;
    }
    this.isEnabled = true;
    this.setCameraControlsOptions(this._cameraControlsOptions);

    if (cameraManager) {
      const previousState = cameraManager.getCameraState();
      this.setCameraState({ position: previousState.position, target: previousState.target });
      this.getCamera().aspect = cameraManager.getCamera().aspect;
    }
  }

  public deactivate(): void {
    if (!this.isEnabled) {
      return;
    }
    this.isEnabled = false;
    this.teardownControls(true);
  }

  public on(event: CameraManagerEventType, callback: CameraEventDelegate): void {
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

  public off(event: CameraManagerEventType, callback: CameraEventDelegate): void {
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

  public fitCameraToBoundingBox(boundingBox: THREE.Box3, duration?: number, radiusFactor: number = 2): void {
    const { position, target } = fitCameraToBoundingBox(this._camera, boundingBox, radiusFactor);
    this.moveCameraTo(position, target, duration);
  }

  public update(deltaTime: number, boundingBox: THREE.Box3): void {
    if (this._nearAndFarNeedsUpdate || !boundingBox.equals(this._currentBoundingBox)) {
      this._nearAndFarNeedsUpdate = false;
      this._currentBoundingBox.copy(boundingBox);
      this.updateCameraNearAndFar();
      this.updateControlsSensitivity();
    }
    if (this._controls.enabled) {
      this._controls.update(deltaTime);
    }
  }

  public dispose(): void {
    this._isDisposed = true;
    this._controls.dispose();
    this.teardownControls();
    disposeOfAllEventListeners(this._events);
    this._inputHandler.dispose();
    this._stopEventTrigger.dispose();
  }

  //================================================
  // INSTANCE METHODS
  //================================================

  /**
   * Gets current Combo Controls options.
   */
  public getComboControlsOptions(): Readonly<ComboControlsOptions> {
    return this._controls.options;
  }

  /**
   * Sets Combo Controls options.
   * Only provided options will be changed, any undefined options will be kept as is.
   */
  public setComboControlsOptions(options: Partial<ComboControlsOptions>): void {
    this._controls.options = options;
  }

  /**
   * Whether keyboard control of the camera is enabled/disabled.
   */
  public get keyboardNavigationEnabled(): boolean {
    return this.getComboControlsOptions().enableKeyboardNavigation;
  }

  /**
   * Sets whether keyboard control of the camera is enabled/disabled.
   */
  public set keyboardNavigationEnabled(enabled: boolean) {
    this.setComboControlsOptions({ enableKeyboardNavigation: enabled });
  }

  private getPosition(): THREE.Vector3 {
    return this._camera.position.clone();
  }

  private getTarget(): THREE.Vector3 {
    return this._controls.getTarget();
  }

  /**
   * Gets current camera controls options.
   */
  public getCameraControlsOptions(): CameraControlsOptions {
    return this._cameraControlsOptions;
  }

  /**
   * Sets camera controls options to customize camera controls modes. See {@link CameraControlsOptions}.
   * @param controlsOptions JSON object with camera controls options.
   */
  public setCameraControlsOptions(controlsOptions: CameraControlsOptions): void {
    this._cameraControlsOptions = { ...DefaultCameraManager.DefaultCameraControlsOptions, ...controlsOptions };

    this._controls.setControlsType(this._cameraControlsOptions.controlsType);

    if (this.isEnabled) {
      // New EventListeners are added in 'setupControls', so to avoid “doubling” of some behaviours we need to tear down controls first.
      this.teardownControls(false);
      this.setupControls();
    }
  }

  private setPositionAndTarget(position: THREE.Vector3, target: THREE.Vector3): void {
    if (this._controls.enabled) {
      this._controls.setState(position, target);
    }
  }

  private set isEnabled(value: boolean) {
    this._isEnabled = value;
    this._controls.enabled = true;
  }

  private get isEnabled(): boolean {
    return this._isEnabled;
  }

  //================================================
  // INSTANCE METHODS: Move camera
  //================================================

  private moveCameraTo(position: THREE.Vector3, target: THREE.Vector3, duration?: number): void {
    if (this._isDisposed) {
      return;
    }
    duration = duration ?? getDefaultDuration(target.distanceTo(this.getPosition()));
    const startTarget = getAnimationStartTarget(this._camera, target);
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

    const tempTarget = new Vector3();
    const tempPosition = new Vector3();

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
        this.setPositionAndTarget(tempPosition, tempTarget);
      })
      .onStop(() => {
        this.setPositionAndTarget(tempPosition, tempTarget);
      })
      .onComplete(() => {
        if (this._isDisposed) {
          return;
        }
        this._controls.temporarlyDisableKeyboard = false;
        this._domElement.removeEventListener('pointerdown', stopTween);
      })
      .start(TWEEN.now());
    tween.update(TWEEN.now());
  }

  private moveCameraTargetTo(target: THREE.Vector3, duration?: number): void {
    if (this._isDisposed) {
      return;
    }
    if (duration === 0) {
      this.setPositionAndTarget(this._camera.position, target);
      return;
    }
    duration = duration ?? getDefaultDuration(target.distanceTo(this._camera.position));

    const startTarget = getAnimationStartTarget(this._camera, target);
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

    const tempTarget = new Vector3();

    const { tween, stopTween } = this.createTweenAnimation(from, to, duration);

    tween
      .onStart(() => {
        this.setComboControlsOptions({ lookAtViewTarget: true });
        this.setPositionAndTarget(this._camera.position, target);
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
        this.setPositionAndTarget(this._camera.position, tempTarget);
      })
      .onComplete(() => {
        if (this._isDisposed) {
          return;
        }
        this.setComboControlsOptions({ lookAtViewTarget: false });
        this._controls.temporarlyDisableKeyboard = false;
        this._domElement.removeEventListener('pointerdown', stopTween);
      })
      .start(TWEEN.now());
    tween.update(TWEEN.now());
  }

  private createTweenAnimation(
    from: any,
    to: any,
    duration: number
  ): { tween: TWEEN.Tween; stopTween: (event: Event) => void } {
    const animation = new TWEEN.Tween(from);
    const stopTween = (event: Event) => {
      if (this._isDisposed) {
        document.removeEventListener('keydown', stopTween);
        animation.stop();
        return;
      }

      if (event.type !== 'keydown' || !this._controls.temporarlyDisableKeyboard) {
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

  //================================================
  // INSTANCE METHODS: Calculations
  //================================================

  private getTargetByBoundingBox(pixelX: number, pixelY: number, boundingBox: THREE.Box3): THREE.Vector3 {
    const modelSize = boundingBox.min.distanceTo(boundingBox.max);
    const lastScrollTargetDistance = this._controls.getScrollTarget().distanceTo(this._camera.position);

    const newTargetDistance =
      lastScrollTargetDistance <= this.getComboControlsOptions().minDistance
        ? Math.min(this._camera.position.distanceTo(boundingBox.getCenter(new Vector3())), modelSize) / 2
        : lastScrollTargetDistance;

    const raycaster = new Raycaster();
    const pixelCoordinates = getNormalizedPixelCoordinates(this._domElement, pixelX, pixelY);
    raycaster.setFromCamera(pixelCoordinates, this._camera);

    const farPoint = raycaster.ray.direction
      .clone()
      .normalize()
      .multiplyScalar(newTargetDistance)
      .add(this._camera.position);

    return farPoint;
  }

  private async getTargetByPixelCoordinates(pixelX: number, pixelY: number): Promise<THREE.Vector3> {
    const modelRaycastData = await this._modelRaycastCallback(pixelX, pixelY, false);

    if (modelRaycastData.intersection?.point) {
      return modelRaycastData.intersection.point;
    }
    return this.getTargetByBoundingBox(pixelX, pixelY, modelRaycastData.modelsBoundingBox);
  }

  //================================================
  // INSTANCE METHODS: Set up/tear down events
  //================================================

  private setupControls() {
    this.setupWheel();

    if (this._controls) {
      this.setMouseWheelOptions(this._cameraControlsOptions);
    }
    if (this._cameraControlsOptions.changeCameraTargetOnClick && this._onClick === undefined) {
      this._inputHandler.on('click', this.onClick);
      this._onClick = this.onClick;
    }
    if (this._cameraControlsOptions.changeCameraPositionOnDoubleClick && this._onDoubleClick === undefined) {
      this._domElement.addEventListener('dblclick', this.onDoubleClick);
      this._onDoubleClick = this.onDoubleClick;
    }
  }

  private setMouseWheelOptions(cameraControlsOptions: CameraControlsOptions) {
    switch (cameraControlsOptions?.mouseWheelAction) {
      case 'zoomToTarget':
        this.setComboControlsOptions({ zoomToCursor: false });
        break;
      case 'zoomPastCursor':
        this.setComboControlsOptions({ useScrollTarget: false });
        this.setComboControlsOptions({ zoomToCursor: true });
        break;
      case 'zoomToCursor':
        this._controls.setScrollTarget(this.getTarget());
        this.setComboControlsOptions({ useScrollTarget: true });
        this.setComboControlsOptions({ zoomToCursor: true });
        break;
      case undefined:
        break;
      default:
        assertNever(cameraControlsOptions.mouseWheelAction);
    }
  }

  private setupWheel() {
    let scrollStarted = false;
    let wasLastScrollZoomOut = false;
    let lastWheelEventTime = 0;

    const lastMousePosition = new Vector2();

    const onWheel = async (event: WheelEvent) => {
      // Added because cameraControls are disabled when doing picking, so
      // preventDefault could be not called on wheel event and produce unwanted scrolling.
      event.preventDefault();
      const pixelPosition = clickOrTouchEventOffset(event, this._domElement);

      const currentTime = performance.now();
      const currentMousePosition = new Vector2(pixelPosition.offsetX, pixelPosition.offsetY);

      const onWheelTimeDelta = currentTime - lastWheelEventTime;

      const mouseDelta = currentMousePosition.distanceTo(lastMousePosition);
      const timeSinceLastPickingTookTooLong = onWheelTimeDelta > DefaultCameraManager.MaximumTimeBetweenRaycasts;

      if (onWheelTimeDelta > DefaultCameraManager.MinimalTimeBetweenRaycasts) {
        scrollStarted = false;
      }
      if (
        !wasLastScrollZoomOut &&
        timeSinceLastPickingTookTooLong &&
        mouseDelta < DefaultCameraManager.MouseDistanceThresholdBetweenRaycasts
      )
        scrollStarted = true;

      wasLastScrollZoomOut = event.deltaY > 0;
      lastWheelEventTime = currentTime;

      lastMousePosition.copy(currentMousePosition);

      const isZoomToCursor = this._cameraControlsOptions.mouseWheelAction === 'zoomToCursor';
      if (!scrollStarted && /*wasLastScrollZoomOut &&*/ isZoomToCursor) {
        scrollStarted = true;
        const scrollTarget = await this.getTargetByPixelCoordinates(pixelPosition.offsetX, pixelPosition.offsetY);
        this._controls.setScrollTarget(scrollTarget);
      }
    };
    if (this._onWheel === undefined) {
      this._domElement.addEventListener('wheel', onWheel);
      this._onWheel = onWheel;
    }
  }

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

  //================================================
  // INSTANCE METHODS: Event Handlers
  //================================================

  private readonly onClick = async (event: PointerEventData) => {
    this._controls.temporarlyDisableKeyboard = true;
    const newTarget = await this.getTargetByPixelCoordinates(event.offsetX, event.offsetY);

    if (this._cameraControlsOptions.changeTargetOnlyOnClick) {
      this.setPositionAndTarget(this._camera.position, newTarget);
    } else {
      this.moveCameraTargetTo(newTarget, DefaultCameraManager.AnimationDuration);
    }
  };

  private readonly onDoubleClick = async (event: PointerEventData) => {
    this._controls.temporarlyDisableKeyboard = true;
    const modelRaycastData = await this._modelRaycastCallback(event.offsetX, event.offsetY, true);

    if (this._controls.controlsType == ControlsType.FirstPerson) {
      this._controls.setControlsType(ControlsType.Orbit);
    }
    // If an object is picked, zoom in to the object (the target will be in the middle of the bounding box)
    if (modelRaycastData.pickedBoundingBox !== undefined) {
      const { position, target } = fitCameraToBoundingBox(this._camera, modelRaycastData.pickedBoundingBox, 3);
      this.moveCameraTo(position, target, DefaultCameraManager.AnimationDuration);
      return;
    }
    // If not particular object is picked, set camera position half way to the target
    const newTarget =
      modelRaycastData.intersection?.point ??
      this.getTargetByBoundingBox(event.offsetX, event.offsetY, modelRaycastData.modelsBoundingBox);

    const newPosition = new Vector3().subVectors(newTarget, this._camera.position);
    newPosition.divideScalar(2);
    newPosition.add(this._camera.position);
    this.moveCameraTo(newPosition, newTarget, DefaultCameraManager.AnimationDuration);
  };

  //================================================
  // INSTANCE METHODS: Update helper Objects
  //================================================

  private createTargetObject(): THREE.Mesh {
    return new Mesh(
      new SphereGeometry(1),
      new MeshBasicMaterial({
        color: '#FFFFFF', // --cogs-primary-inverted (dark)
        transparent: true,
        opacity: 0.8,
        depthTest: false
      })
    );
  }

  private createLookAtObject(): THREE.Mesh {
    return new Mesh(
      new SphereGeometry(1),
      new MeshBasicMaterial({
        color: '#FF0000', // --cogs-primary-inverted (dark)
        transparent: true,
        opacity: 0.8,
        depthTest: false
      })
    );
  }

  private updateVisibleObjects() {
    if (this._scene === undefined) {
      return;
    }
    const getScale = (): number => {
      const diagonal = this.getBoundingBoxDiagonal();
      return Math.max(Math.min(diagonal / 200, 0.2), 0.1);
    };

    const show = this._controls.controlsType !== ControlsType.FirstPerson;
    if (show && this._cameraControlsOptions.showTarget) {
      if (!this._targetObject) {
        this._targetObject = this.createTargetObject();
        this._scene?.add(this._targetObject);
      }
      this._targetObject.position.copy(this._controls.getTarget());
      this._targetObject.lookAt(this._camera.position);
      this._targetObject.scale.setScalar(getScale());
    } else {
      if (this._targetObject) {
        this._scene?.remove(this._targetObject);
        this._targetObject = undefined;
      }
    }
    if (this._cameraControlsOptions.showLookAt) {
      if (!this._lookAtObject) {
        this._lookAtObject = this.createLookAtObject();
        this._scene?.add(this._lookAtObject);
      }
      this._lookAtObject.position.copy(this._controls.getLookAt());
      this._lookAtObject.lookAt(this._camera.position);
      this._lookAtObject.scale.setScalar(getScale());
    } else {
      if (this._lookAtObject) {
        this._scene?.remove(this._lookAtObject);
        this._lookAtObject = undefined;
      }
    }
  }

  //================================================
  // INSTANCE METHODS: Updates
  //================================================

  private updateCameraNearAndFar(): void {
    // See https://stackoverflow.com/questions/8101119/how-do-i-methodically-choose-the-near-clip-plane-distance-for-a-perspective-proj
    if (this._isDisposed) {
      return;
    }
    if (!this.automaticNearFarPlane) {
      return;
    }
    CameraManagerHelper.updateCameraNearAndFar(this._camera, this._currentBoundingBox);
  }

  private updateControlsSensitivity(): void {
    if (this._isDisposed) {
      return;
    }
    if (!this.automaticControlsSensitivity) {
      return;
    }
    // This is used to determine the speed of the camera when flying with ASDW.
    // We want to either let it be controlled by the near plane if we are far away,
    // but no more than a fraction of the bounding box of the system if inside
    const diagonal = this.getBoundingBoxDiagonal();
    const diagonalMinDistance = diagonal * 0.002;
    const nearMinDistance = 0.1 * this._camera.near;
    let minDistance = Math.max(diagonalMinDistance, nearMinDistance);

    minDistance = Math.min(minDistance, DefaultCameraManager.MaximumMinDistance);

    // console.log('diagonal', diagonal);
    // console.log('diagonalMinDistance', diagonalMinDistance);
    // console.log('nearMinDistance', nearMinDistance);
    // console.log('minDistance', minDistance);

    this.setComboControlsOptions({ minDistance: minDistance });
  }

  private getBoundingBoxDiagonal(): number {
    return this._currentBoundingBox.min.distanceTo(this._currentBoundingBox.max);
  }
}

const MIN_ANIMATION_DURATION = 300;
const MAX_ANIMATION_DURATION = 1250;

function getDefaultDuration(distanceToCamera: number): number {
  const duration = distanceToCamera * 125; // 125ms per unit distance
  return clamp(duration, MIN_ANIMATION_DURATION, MAX_ANIMATION_DURATION);
}

function getAnimationStartTarget(camera: THREE.PerspectiveCamera, newTarget: THREE.Vector3): THREE.Vector3 {
  const raycaster = new Raycaster();
  raycaster.setFromCamera(new Vector2(), camera);
  const distanceToTarget = newTarget.distanceTo(camera.position);
  const scaledDirection = raycaster.ray.direction.clone().multiplyScalar(distanceToTarget);
  return raycaster.ray.origin.clone().add(scaledDirection);
}
