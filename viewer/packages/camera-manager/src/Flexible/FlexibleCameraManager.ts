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
import { FlexibleCameraMarkers } from './FlexibleCameraMarkers';
import { moveCameraTargetTo, moveCameraTo } from './moveCamera';
import { WheelZoomType } from './WheelZoomType';

/**
 * Flexible implementation of {@link CameraManager}. The user can switch between Orbit, FirstPersion or OrbitInCenter
 * Supports automatic update of camera near and far planes and animated change of camera position and target.
 * @experimental
 */
export class FlexibleCameraManager implements CameraManager {
  //================================================
  // INSTANCE FIELDS:
  //================================================

  private readonly _events = { cameraChange: new EventTrigger<CameraChangeDelegate>() };
  private readonly _stopEventTrigger: DebouncedCameraStopEventTrigger;
  private readonly _controls: FlexibleControls;
  private readonly _camera: PerspectiveCamera;
  private readonly _domElement: HTMLElement;
  private readonly _inputHandler: InputHandler;
  private readonly _markers?: undefined | FlexibleCameraMarkers;
  private readonly _currentBoundingBox: Box3 = new Box3();
  private _isDisposed = false;
  private _nearAndFarNeedsUpdate = false;

  // The active/inactive state of this manager. Does not always match up with the controls
  // as these are temporarily disabled to block onWheel input during `zoomToCursor`-mode
  private _isEnabled = true;

  // For the wheel event
  private _prevTime = 0;
  private readonly _prevCoords = new Vector2();

  //================================================
  // INSTANCE FIELDS: Events
  //================================================

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
    this._controls = new FlexibleControls(this.camera, domElement, new FlexibleControlsOptions());
    this._domElement = domElement;
    this._inputHandler = inputHandler;
    this._modelRaycastCallback = raycastFunction;
    if (scene) {
      this._markers = new FlexibleCameraMarkers(scene);
    }

    this.addEventListeners();
    this._controls.addEventListeners(); // After this.addEventListeners();

    this.controls.addEventListener('cameraChange', event => {
      const { position, target } = event.camera;
      this._events.cameraChange.fire(position.clone(), target.clone());
      this._nearAndFarNeedsUpdate = true;
      if (this._markers) {
        this._markers.update(this);
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

    if (this.controls.isEnabled) {
      this.controls.cameraRawRotation.copy(newRotation);
    }
    this.setPositionAndTarget(newPosition, newTarget);
  }

  public activate(cameraManager?: CameraManager): void {
    if (this.isEnabled) {
      return;
    }
    this.isEnabled = true;

    if (cameraManager) {
      const previousState = cameraManager.getCameraState();
      this.setCameraState({ position: previousState.position, target: previousState.target });
      this.camera.aspect = cameraManager.getCamera().aspect;
    }
  }

  public deactivate(): void {
    if (!this.isEnabled) {
      return;
    }
    this.isEnabled = false;
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
    if (this.controls.isEnabled) {
      this.controls.update(deltaTime);
    }
  }

  public dispose(): void {
    this._isDisposed = true;
    this.controls.dispose();
    this.removeEventListeners();
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
    this.controls.isEnabled = true;
  }

  private getPosition(): Vector3 {
    return this.camera.position.clone();
  }

  private getTarget(): Vector3 {
    return this.controls.getTarget();
  }

  public setPositionAndTarget(position: Vector3, target: Vector3): void {
    if (this.controls.isEnabled) {
      this.controls.setState(position, target);
    }
  }

  //================================================
  // INSTANCE METHODS: Calculations
  //================================================

  private getTargetByBoundingBox(pixelX: number, pixelY: number, boundingBox: Box3): Vector3 {
    const modelSize = boundingBox.min.distanceTo(boundingBox.max);
    const lastScrollCursorDistance = this.controls.getScrollCursor().distanceTo(this.camera.position);

    const distance =
      lastScrollCursorDistance <= this.options.sensitivity
        ? Math.min(this.camera.position.distanceTo(boundingBox.getCenter(new Vector3())), modelSize) / 2
        : lastScrollCursorDistance;

    return this.controls.getPointBehindPixel(pixelX, pixelY, distance);
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

  private addEventListeners() {
    this._inputHandler.on('click', this.onClick);
    this.domElement.addEventListener('keydown', this.onKeyDown);
    this.domElement.addEventListener('dblclick', this.onDoubleClick);
    this.domElement.addEventListener('wheel', this.onWheel);
  }

  private removeEventListeners(): void {
    this._inputHandler.off('click', this.onClick);
    this.domElement.removeEventListener('dblclick', this.onDoubleClick);
    this.domElement.removeEventListener('keydown', this.onKeyDown);
    this.domElement.removeEventListener('wheel', this.onWheel);
  }

  //================================================
  // INSTANCE METHODS: Event Handlers
  //================================================

  private readonly onKeyDown = (event: KeyboardEvent) => {
    if (!this.isEnabled) {
      return;
    }
    if (!this.options.enableChangeControlsTypeOn123Key) {
      return;
    }
    if (event.code == 'Digit1') {
      return this.controls.setControlsType(ControlsType.FirstPerson);
    } else if (event.code == 'Digit2') {
      return this.controls.setControlsType(ControlsType.Orbit);
    } else if (event.code == 'Digit3') {
      return this.controls.setControlsType(ControlsType.OrbitInCenter);
    }
  };

  private readonly onClick = async (event: PointerEventData) => {
    if (!this.isEnabled) return;
    if (this.options.mouseClickType !== MouseActionType.None) {
      await this.mouseAction(event, this.options.mouseClickType);
    }
  };

  private readonly onDoubleClick = async (event: PointerEventData) => {
    if (!this.isEnabled) return;
    if (this.options.mouseDoubleClickType !== MouseActionType.None) {
      await this.mouseAction(event, this.options.mouseDoubleClickType);
    }
  };

  private readonly onWheel = async (event: WheelEvent) => {
    if (!this.isEnabled) return;
    if (this.options.realMouseWheelAction !== WheelZoomType.ToCursor) {
      return;
    }
    // Nils: Need this for a while to fine tune
    console.log('mouseWheelAction: ', this.options.realMouseWheelAction);

    // Added because cameraControls are disabled when doing picking, so
    // preventDefault could be not called on wheel event and produce unwanted scrolling.
    event.preventDefault();
    const pixelPosition = clickOrTouchEventOffset(event, this.domElement);
    const currentTime = performance.now();
    const currentCoords = new Vector2(pixelPosition.offsetX, pixelPosition.offsetY);
    const deltaTime = currentTime - this._prevTime;
    const deltaCoords = currentCoords.distanceTo(this._prevCoords);

    this._prevTime = currentTime;
    this._prevCoords.copy(currentCoords);

    if (deltaTime <= this.options.minimumTimeBetweenRaycasts) {
      return;
    }
    const hasWaited = deltaTime >= this.options.maximumTimeBetweenRaycasts;
    const hasMoved = deltaCoords >= this.options.mouseDistanceThresholdBetweenRaycasts;
    if (!(hasMoved && hasWaited)) {
      return;
    }
    
    const scrollCursor = await this.getTargetByPixelCoordinates(pixelPosition.offsetX, pixelPosition.offsetY);
    this.controls.setScrollCursor(scrollCursor);
    console.log('onWheel set');
    this._prevTime = currentTime;
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
    if (!this.options.automaticNearFarPlane) {
      return;
    }
    CameraManagerHelper.updateCameraNearAndFar(this.camera, this._currentBoundingBox);
  }

  private updateControlsSensitivity(): void {
    if (this._isDisposed) {
      return;
    }
    if (!this.options.automaticSensitivity) {
      return;
    }
    // This is used to determine the speed of the camera when flying with ASDW.
    // We want to either let it be controlled by the near plane if we are far away,
    // but no more than a fraction of the bounding box of the system if inside
    const diagonal = this.getBoundingBoxDiagonal();
    const diagonalFraction = diagonal * this.options.sensitivityDiagonalFraction;
    const nearFraction = 0.1 * this.camera.near;
    const sensitivity = Math.max(diagonalFraction, nearFraction);

    this.options.sensitivity = this.options.getLegalSensitivity(sensitivity);

    // Nils: Need this for a while to fine tune
    // console.log('diagonalFraction:     ', diagonalFraction);
    // console.log('nearFraction:         ', nearFraction);
    // console.log('sensitivity:          ', sensitivity);
    // console.log('sensitivity (finally):', this.options.sensitivity);
  }

  public getBoundingBoxDiagonal(): number {
    return this._currentBoundingBox.min.distanceTo(this._currentBoundingBox.max);
  }
}
