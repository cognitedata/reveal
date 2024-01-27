/*!
 * Copyright 2021 Cognite AS
 */

import { Box3, PerspectiveCamera, Quaternion, Raycaster, Vector2, Vector3, Scene } from 'three';

import { FlexibleControls } from './FlexibleControls';
import { FlexibleControlsOptions } from './FlexibleControlsOptions';

import {
  assertNever,
  EventTrigger,
  InputHandler,
  disposeOfAllEventListeners,
  PointerEventData,
  fitCameraToBoundingBox,
  clickOrTouchEventOffset
} from '@reveal/utilities';

import { getNormalizedPixelCoordinates } from '@reveal/utilities';
import {
  CameraChangeDelegate,
  CameraEventDelegate,
  CameraManagerCallbackData,
  CameraManagerEventType,
  CameraState,
  CameraStopDelegate
} from './../types';
import { CameraManagerHelper } from './../CameraManagerHelper';
import { CameraManager } from './../CameraManager';
import { ControlsType } from './ControlsType';
import { MouseActionType } from './MouseActionType';
import { DebouncedCameraStopEventTrigger } from '../utils/DebouncedCameraStopEventTrigger';
import { FlexibleCameraObjects } from './FlexibleCameraObjects';
import { moveCameraTargetTo, moveCameraTo } from './moveCamera';
import { WheelZoomType } from './WheelZoomType';

/**
 * Default implementation of {@link CameraManager}. Uses target-based orbit controls combined with
 * keyboard and mouse navigation possibility. Supports automatic update of camera near and far
 * planes and animated change of camera position and target.
 */
export class FlexibleCameraManager implements CameraManager {
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
  private readonly _controls: FlexibleControls;
  private readonly _camera: PerspectiveCamera;
  private readonly _domElement: HTMLElement;
  private readonly _inputHandler: InputHandler;
  private readonly _visibleObjects?: undefined | FlexibleCameraObjects;
  private readonly _currentBoundingBox: Box3 = new Box3();
  private _isDisposed = false;
  private _nearAndFarNeedsUpdate = false;

  // The active/inactive state of this manager. Does not always match up with the controls
  // as these are temporarily disabled to block onWheel input during `zoomToCursor`-mode
  private _isEnabled = true;

  //================================================
  // INSTANCE FIELDS: Events
  //================================================

  private _onWheel: ((event: WheelEvent) => void) | undefined = undefined;
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
    camera?: PerspectiveCamera,
    scene?: Scene
  ) {
    this._camera = camera ?? new PerspectiveCamera(60, undefined, 0.1, 10000);
    this._domElement = domElement;
    this._inputHandler = inputHandler;
    this._modelRaycastCallback = raycastFunction;
    this._controls = new FlexibleControls(this.camera, domElement, new FlexibleControlsOptions());

    if (scene) {
      this._visibleObjects = new FlexibleCameraObjects(scene);
    }

    this.setupControls();
    this.controls.addEventListener('cameraChange', event => {
      const { position, target } = event.camera;
      this._events.cameraChange.fire(position.clone(), target.clone());
      this._nearAndFarNeedsUpdate = true;
      if (this._visibleObjects) {
        this._visibleObjects.updateVisibleObjects(this);
      }
    });

    this.isEnabled = true;
    this._stopEventTrigger = new DebouncedCameraStopEventTrigger(this);
  }

  //================================================
  // IMPLEMENTATION OF CameraManager (In correct order)
  //================================================

  public getCamera(): PerspectiveCamera {
    return this.camera;
  }

  public getCameraState(): Required<CameraState> {
    return {
      position: this.getPosition(),
      rotation: this.camera.quaternion.clone(),
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
        ? CameraManagerHelper.calculateNewTargetFromRotation(this.camera, state.rotation, this.getTarget(), newPosition)
        : this.getTarget());

    if (this.controls.enabled) {
      this.controls.cameraRawRotation.copy(newRotation);
    }
    this.setPositionAndTarget(newPosition, newTarget);
  }

  public activate(cameraManager?: CameraManager): void {
    if (this.isEnabled) {
      return;
    }
    this.teardownControls();
    this.setupControls();

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
    this.teardownControls();
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

  public fitCameraToBoundingBox(boundingBox: Box3, duration?: number, radiusFactor: number = 2): void {
    const { position, target } = fitCameraToBoundingBox(this.camera, boundingBox, radiusFactor);
    moveCameraTo(this, position, target, duration);
  }

  public update(deltaTime: number, boundingBox: Box3): void {
    if (this._nearAndFarNeedsUpdate || !boundingBox.equals(this._currentBoundingBox)) {
      this._nearAndFarNeedsUpdate = false;
      this._currentBoundingBox.copy(boundingBox);
      this.updateCameraNearAndFar();
      this.updateControlsSensitivity();
    }
    if (this.controls.enabled) {
      this.controls.update(deltaTime);
    }
  }

  public dispose(): void {
    this._isDisposed = true;
    this.controls.dispose();
    this.teardownControls();
    disposeOfAllEventListeners(this._events);
    this._inputHandler.dispose();
    this._stopEventTrigger.dispose();
  }

  //================================================
  // INSTANCE METHODS
  //================================================

  public get options(): FlexibleControlsOptions {
    return this.controls.options;
  }

  public get controls(): FlexibleControls {
    return this._controls;
  }

  public get camera(): PerspectiveCamera {
    return this._camera;
  }

  public get domElement(): HTMLElement {
    return this._domElement;
  }

  public get isEnabled(): boolean {
    return this._isEnabled;
  }

  public get isDisposed(): boolean {
    return this._isDisposed;
  }

  private set isEnabled(value: boolean) {
    this._isEnabled = value;
    this.controls.enabled = true;
  }

  private getPosition(): Vector3 {
    return this.camera.position.clone();
  }

  private getTarget(): Vector3 {
    return this.controls.getTarget();
  }

  public setPositionAndTarget(position: Vector3, target: Vector3): void {
    if (this.controls.enabled) {
      this.controls.setState(position, target);
    }
  }

  //================================================
  // INSTANCE METHODS: Calculations
  //================================================

  private getTargetByBoundingBox(pixelX: number, pixelY: number, boundingBox: Box3): Vector3 {
    const modelSize = boundingBox.min.distanceTo(boundingBox.max);
    const lastScrollCursorDistance = this.controls.getScrollCursor().distanceTo(this.camera.position);

    const newTargetDistance =
      lastScrollCursorDistance <= this.options.minDistance
        ? Math.min(this.camera.position.distanceTo(boundingBox.getCenter(new Vector3())), modelSize) / 2
        : lastScrollCursorDistance;

    const raycaster = new Raycaster();
    const pixelCoordinates = getNormalizedPixelCoordinates(this.domElement, pixelX, pixelY);
    raycaster.setFromCamera(pixelCoordinates, this.camera);

    const farPoint = raycaster.ray.direction
      .clone()
      .normalize()
      .multiplyScalar(newTargetDistance)
      .add(this.camera.position);

    return farPoint;
  }

  private async getTargetByPixelCoordinates(pixelX: number, pixelY: number): Promise<Vector3> {
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
    this._inputHandler.on('click', this.onClick);
    this.domElement.addEventListener('dblclick', this.onDoubleClick);
    this.setupWheel();
  }

  private setupWheel() {
    let previousTime = 0;
    const previousCoords = new Vector2();

    const onWheel = async (event: WheelEvent) => {
      if (this.options.realMouseWheelAction !== WheelZoomType.ToCursor) {
        return;
      }
      console.log('Try set Target');
      // Added because cameraControls are disabled when doing picking, so
      // preventDefault could be not called on wheel event and produce unwanted scrolling.
      event.preventDefault();
      const pixelPosition = clickOrTouchEventOffset(event, this.domElement);
      const currentTime = performance.now();
      const currentCoords = new Vector2(pixelPosition.offsetX, pixelPosition.offsetY);
      const deltaTime = currentTime - previousTime;
      const deltaCoords = currentCoords.distanceTo(previousCoords);

      previousTime = currentTime;
      previousCoords.copy(currentCoords);

      if (deltaTime < this.options.maximumTimeBetweenRaycasts) {
        return;
      }
      if (deltaCoords < this.options.mouseDistanceThresholdBetweenRaycasts) {
        return;
      }
      const scrollCursor = await this.getTargetByPixelCoordinates(pixelPosition.offsetX, pixelPosition.offsetY);
      this.controls.setScrollCursor(scrollCursor);
      console.log('Target is set', scrollCursor);
      previousTime = currentTime;
    };
    if (this._onWheel === undefined) {
      this.domElement.addEventListener('wheel', onWheel);
      this._onWheel = onWheel;
    }
  }

  private teardownControls(): void {
    this._inputHandler.off('click', this.onClick);
    this.domElement.removeEventListener('dblclick', this.onDoubleClick);
    if (this._onWheel !== undefined) {
      this.domElement.removeEventListener('wheel', this._onWheel);
      this._onWheel = undefined;
    }
  }

  //================================================
  // INSTANCE METHODS: Event Handlers
  //================================================

  private readonly onClick = async (event: PointerEventData) => {
    if (this.options.mouseClickType !== MouseActionType.None) {
      await this.mouseAction(event, this.options.mouseClickType);
    }
  };

  private readonly onDoubleClick = async (event: PointerEventData) => {
    if (this.options.mouseDoubleClickType !== MouseActionType.None) {
      await this.mouseAction(event, this.options.mouseDoubleClickType);
    }
  };

  private async mouseAction(event: PointerEventData, mouseActionType: MouseActionType) {
    if (mouseActionType === MouseActionType.None) {
      return;
    }
    if (mouseActionType === MouseActionType.SetTarget) {
      const newTarget = await this.getTargetByPixelCoordinates(event.offsetX, event.offsetY);
      this.setPositionAndTarget(this.camera.position, newTarget);
    } else if (mouseActionType === MouseActionType.SetTargetAndCameraDirection) {
      const newTarget = await this.getTargetByPixelCoordinates(event.offsetX, event.offsetY);
      moveCameraTargetTo(this, newTarget, this.options.animationDuration);
    } else if (mouseActionType === MouseActionType.SetTargetAndCameraPosition) {
      if (this.controls.controlsType === ControlsType.FirstPerson) {
        this.controls.setControlsType(ControlsType.Orbit);
      }
      this.setTargetAndCameraPosition(event);
    }
  }

  private async setTargetAndCameraPosition(event: PointerEventData) {
    const modelRaycastData = await this._modelRaycastCallback(event.offsetX, event.offsetY, true);
    // If an object is picked, zoom in to the object (the target will be in the middle of the bounding box)
    if (modelRaycastData.pickedBoundingBox !== undefined) {
      const { position, target } = fitCameraToBoundingBox(this.camera, modelRaycastData.pickedBoundingBox, 3);
      moveCameraTo(this, position, target, this.options.animationDuration);
      return;
    }
    // If not particular object is picked, set camera position half way to the target
    const newTarget =
      modelRaycastData.intersection?.point ??
      this.getTargetByBoundingBox(event.offsetX, event.offsetY, modelRaycastData.modelsBoundingBox);

    const newPosition = new Vector3().subVectors(newTarget, this.camera.position);
    newPosition.divideScalar(2);
    newPosition.add(this.camera.position);
    moveCameraTo(this, newPosition, newTarget, this.options.animationDuration);
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
    CameraManagerHelper.updateCameraNearAndFar(this.camera, this._currentBoundingBox);
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
    const nearMinDistance = 0.1 * this.camera.near;
    let minDistance = Math.max(diagonalMinDistance, nearMinDistance);

    minDistance = Math.min(minDistance, this.options.maximumMinDistance);

    // console.log('diagonal', diagonal);
    // console.log('diagonalMinDistance', diagonalMinDistance);
    // console.log('nearMinDistance', nearMinDistance);
    // console.log('minDistance', minDistance);

    this.options.minDistance = minDistance;
  }

  public getBoundingBoxDiagonal(): number {
    return this._currentBoundingBox.min.distanceTo(this._currentBoundingBox.max);
  }
}
