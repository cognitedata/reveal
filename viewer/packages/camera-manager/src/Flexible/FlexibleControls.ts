/*!
 * Copyright 2024 Cognite AS
 */

import remove from 'lodash/remove';
import {
  MathUtils,
  OrthographicCamera,
  PerspectiveCamera,
  Quaternion,
  Raycaster,
  Spherical,
  Vector2,
  Vector3
} from 'three';
import Keyboard from '../Keyboard';
import {
  Vector3Pool,
  getNormalizedPixelCoordinates,
  getPixelCoordinatesFromEvent,
  getWheelEventDelta
} from '@reveal/utilities';
import { FlexibleControlsType } from './FlexibleControlsType';
import { FlexibleControlsOptions } from './FlexibleControlsOptions';
import { FlexibleWheelZoomType } from './FlexibleWheelZoomType';
import { DampedVector3 } from './DampedVector3';
import { DampedSpherical } from './DampedSpherical';
import { GetPickedPointByPixelCoordinates } from './GetPickedPointByPixelCoordinates';
import { FlexibleControlsTranslator } from './FlexibleControlsTranslator';
import { FlexibleControlsRotationHelper } from './FlexibleControlsRotationHelper';
import { FlexibleCameraEventTarget } from './FlexibleCameraEventTarget';

const TARGET_FPS = 30;
const XYZ_EPSILON = 0.001; // Used for points
const RAD_EPSILON = Math.PI / 10000; // Used for angles

/**
 * @beta
 */
export class FlexibleControls {
  //================================================
  // INSTANCE FIELDS
  //================================================

  private _isEnabled: boolean = true;
  private _isInitialized: boolean = false;
  private _isStationary = false; // If true the options.controlsType should not be used. Camera cannot change position and zooms by fov
  public temporarlyDisableKeyboard: boolean = false;

  private readonly _options: FlexibleControlsOptions;
  private readonly _domElement: HTMLElement;
  private readonly _camera: PerspectiveCamera | OrthographicCamera;

  // These are describe below in the ascii-art
  private readonly _target: DampedVector3 = new DampedVector3();
  private readonly _cameraPosition: DampedVector3 = new DampedVector3();
  private readonly _cameraVector: DampedSpherical = new DampedSpherical();

  // Temporary used, undefined if not in use
  private _scrollDirection: Vector3 | undefined = undefined; // When using the wheel this is vector to the picked point from
  private _scrollDistance = 0; // When using the wheel this is the distance to the picked point
  private _tempTarget: Vector3 | undefined = undefined;

  private readonly _listeners: FlexibleCameraEventTarget = new FlexibleCameraEventTarget();
  private readonly _keyboard: Keyboard;
  private readonly _touchEvents: Array<PointerEvent> = [];
  private _getPickedPointByPixelCoordinates: GetPickedPointByPixelCoordinates | undefined;

  // Temporary objects used for calculations to avoid allocations
  private readonly _rotationHelper = new FlexibleControlsRotationHelper();

  // Used in mouse move, if not dragging it is undefined
  private _mouseDragInfo: MouseDragInfo | undefined = undefined;

  // For the wheel event
  private _prevTime = 0;
  private readonly _prevCoords = new Vector2();

  //        FlexibleControlsType.OrbitInCenter
  //          , - ~ ~ ~ - ,
  //      , '               ' ,
  //    ,                       ,   In this state the camera rotating round the target
  //   ,                         ,  which is in the center of the sceen.
  //  ,          Target           ,
  //  ,             *    <--------* CameraPosition
  //  ,               CameraVector,
  //   ,                          ,
  //    ,                       ,
  //      ,                  , '
  //        ' - , _  _ ,  -
  //
  //
  //       FlexibleControlsType.Orbit
  //          , - ~ ~ ~ - ,
  //      , '               ' ,
  //    ,                       ,   In this state the camera rotating round the target
  //   ,                         ,
  //  ,          Target           ,
  //  ,             *             ,
  //  ,                           ,
  //   ,                <--------* CameraPosition
  //    ,          CameraVector ,
  //      ,                  , '
  //        ' - , _  _ ,  -
  //
  //      FlexibleControlsType.FirstPerson
  //          , - ~ ~ ~ - ,
  //      , '               ' ,
  //    ,                       ,
  //   ,                         ,   In this state the camera rotating round itself.
  //  ,        CameraPosition     ,  The target is ignored.
  //  ,             *----->       ,
  //  ,          CameraVector     ,
  //   ,                         ,
  //    ,                       ,
  //      ,                 , '
  //        ' - , _  _ ,  -
  //================================================
  // CONSTRUCTOR
  //================================================

  constructor(camera: PerspectiveCamera | undefined, domElement: HTMLElement, options: FlexibleControlsOptions) {
    if (camera) {
      this._camera = camera;
      options.defaultFov = this.fov;
    } else {
      this._camera = new PerspectiveCamera(options.defaultFov, undefined, 0.1, 10000);
    }
    this._domElement = domElement;
    this._options = options;
    this._keyboard = new Keyboard();
    this._cameraVector.copy(new Vector3(1, 0, 0));
  }

  //================================================
  // INSTANCE PROPERTIES:
  //================================================

  get options(): FlexibleControlsOptions {
    return this._options;
  }

  get camera(): PerspectiveCamera | OrthographicCamera {
    return this._camera;
  }

  get domElement(): HTMLElement {
    return this._domElement;
  }

  get listeners(): FlexibleCameraEventTarget {
    return this._listeners;
  }

  get target(): DampedVector3 {
    return this._target;
  }

  get cameraVector(): DampedSpherical {
    return this._cameraVector;
  }

  get cameraPosition(): DampedVector3 {
    return this._cameraPosition;
  }

  get isEnabled(): boolean {
    return this._isEnabled;
  }

  set isEnabled(value: boolean) {
    this._isEnabled = value;
    this._keyboard.isEnabled = value;
  }

  get isInitialized(): boolean {
    return this._isInitialized;
  }

  set isInitialized(value: boolean) {
    this._isInitialized = value;
  }

  public get controlsType(): FlexibleControlsType {
    return this.options.controlsType;
  }

  public get isStationary(): boolean {
    return this._isStationary;
  }

  public set isStationary(value: boolean) {
    if (this._isStationary == value) {
      return;
    }
    if (this._isStationary) {
      this.setFov(this.options.defaultFov);
    }
    this._isStationary = value;
  }

  public get fov(): number {
    if (!(this._camera instanceof PerspectiveCamera)) {
      return 0;
    }
    return this._camera.fov;
  }

  set getPickedPointByPixelCoordinates(getPickedPointByPixelCoordinates: GetPickedPointByPixelCoordinates | undefined) {
    this._getPickedPointByPixelCoordinates = getPickedPointByPixelCoordinates;
  }

  get getPickedPointByPixelCoordinates(): GetPickedPointByPixelCoordinates | undefined {
    return this._getPickedPointByPixelCoordinates;
  }

  //================================================
  // INSTANCE METHODS: Public getters and setters
  //================================================

  public getTarget(): Vector3 {
    return this._target.value.clone();
  }

  public setTarget(value: Vector3): void {
    this._target.copy(value);
  }

  private getLookAt(): Vector3 {
    if (this._tempTarget) {
      return this._tempTarget;
    }
    return newVector3().addVectors(this._cameraPosition.value, this._cameraVector.getValueVector());
  }

  public getState(): { target: Vector3; position: Vector3 } {
    return {
      target: this.getTarget(),
      position: this._camera.position.clone()
    };
  }

  public getNormalizedPixelCoordinates(position: Vector2): Vector2 {
    return getNormalizedPixelCoordinates(this._domElement, position.x, position.y);
  }

  public setScrollCursor(value: Vector3 | undefined): void {
    if (!value) {
      this._scrollDirection = undefined;
      return;
    } else if (!this._scrollDirection) {
      this._scrollDirection = value?.clone();
    } else {
      this._scrollDirection.copy(value);
    }
    this._scrollDirection.sub(this._camera.position);
    this._scrollDistance = this._scrollDirection.length();
    this._scrollDirection.normalize();
  }

  public setTempTarget(value: Vector3 | undefined): void {
    if (!value) {
      this._tempTarget = undefined;
    } else if (!this._tempTarget) {
      this._tempTarget = value?.clone();
    } else {
      this._tempTarget.copy(value);
    }
  }

  setFov(value: number, triggerCameraChangeEvent: boolean = true): boolean {
    if (!(this._camera instanceof PerspectiveCamera)) {
      return false;
    }
    const fov = this.options.getLegalFov(value);
    if (this.fov === fov) {
      return false;
    }
    this._camera.fov = fov;
    this._camera.updateProjectionMatrix();
    if (triggerCameraChangeEvent) {
      this.listeners.dispatchEvent('cameraChange', this);
    }
    return true;
  }

  public setPositionAndTarget(position: Vector3, target: Vector3): void {
    this.isInitialized = true;
    this._cameraPosition.copy(position);
    this._target.copy(target);

    // CameraVector = Target - Position
    const vector = newVector3().subVectors(target, position);
    vector.normalize();
    this._cameraVector.copy(vector);
    this.updateCameraAndTriggerCameraChangeEvent();
  }

  public setPosition(position: Vector3): void {
    this._cameraPosition.copy(position);
    this.updateCameraAndTriggerCameraChangeEvent();
  }

  public setPositionAndDirection(position: Vector3, direction: Vector3): void {
    this.isInitialized = true;
    this._cameraPosition.copy(position);
    this._cameraVector.copy(direction);
    this.updateCameraAndTriggerCameraChangeEvent();
  }

  public setPositionAndRotation(position: Vector3, rotation: Quaternion): void {
    this.isInitialized = true;
    this._cameraPosition.copy(position);

    const cameraVector = newVector3().set(0, 0, -1);
    cameraVector.applyQuaternion(rotation);

    if (DampedSpherical.isVertical(cameraVector)) {
      // Looking from top or bottom, the theta must be defined in a proper way
      const upVector = newVector3().set(0, 1, 0);
      upVector.applyQuaternion(rotation);
      this._cameraVector.setThetaFromVector(upVector);
    }
    this._cameraVector.copy(cameraVector);
    this.updateCameraAndTriggerCameraChangeEvent();
  }

  public setControlsType(controlsType: FlexibleControlsType): boolean {
    if (controlsType === this.options.controlsType) {
      return false;
    }
    this.options.controlsType = controlsType;
    if (controlsType === FlexibleControlsType.OrbitInCenter) {
      // This actually change target due to not change the camera position and lookAt
      // Target = DistanceToTarget * CameraVector + Position
      const distanceToTarget = this._cameraPosition.end.distanceTo(this._target.end);
      const cameraVector = this._cameraVector.getEndVector();
      cameraVector.multiplyScalar(distanceToTarget);

      this._target.end.copy(cameraVector.add(this._cameraPosition.end));
      this._target.synchronize();
      this.updateCameraAndTriggerCameraChangeEvent();
    }
    this.listeners.dispatchEvent('controlsTypeChange', this);

    // This shouldn't be here, but RevealManager listen to this in order to do a redraw
    // Cannot triggerControlsTypeChangeEvent since it is not part of the predefined general events
    // The scene must be redrawn because of the markers
    this.listeners.dispatchEvent('cameraChange', this);
    return true;
  }

  //================================================
  // INSTANCE METHODS: Private Getters
  //================================================

  private getPanFactor() {
    let speed = this._options.sensitivity;
    // The panning goes parallel to the screen, not perpendicular to the screen.
    // So we get y = x * tan (a), where y is parallel to the screen
    // half of the fov is center to top of screen
    if (this._camera instanceof PerspectiveCamera) {
      const fovFactor = Math.tan(MathUtils.degToRad(this.fov / 2));
      speed *= fovFactor; // Typical value is 0.57
    }
    const factor = 2 / this._domElement.clientHeight;
    speed *= factor; // Typical value is 0.0015
    return speed;
  }

  private getWheelSpeed(): number {
    return this._options.sensitivity * this.options.wheelDollySpeed;
  }

  private getDampingFactor(deltaTimeS: number) {
    if (!this._options.enableDamping) {
      return 1;
    }
    const actualFPS = Math.min(1 / deltaTimeS, TARGET_FPS);
    const targetFPSOverActualFPS = TARGET_FPS / actualFPS;
    const dampingFactor = Math.min(this._options.dampingFactor * targetFPSOverActualFPS, 1);
    return dampingFactor;
  }

  //================================================
  // INSTANCE METHODS: Public operations
  //================================================

  public update(deltaTimeS: number, forceUpdate = false): boolean {
    return this.updateCamera(deltaTimeS, forceUpdate);
  }

  public rotateCameraTo(startDirection: Spherical, endDirection: Spherical, factor: number): void {
    this._rotationHelper.begin(this);
    if (factor >= 1) {
      this._cameraVector.end.copy(endDirection);
    } else {
      const direction = startDirection.clone();
      DampedSpherical.dampSphericalVectors(direction, endDirection, factor);
      this._cameraVector.end.copy(direction);
    }
    this._rotationHelper.end(this);
    this.updateCameraAndTriggerCameraChangeEvent();
  }

  //================================================
  // INSTANCE METHODS: Event
  //================================================

  public async onPointerDown(event: PointerEvent, _leftButton: boolean): Promise<void> {
    if (!this.isEnabled) {
      return;
    }
    this._cameraVector.synchronizeEnd();
    if (isMouse(event)) {
      const position = getPixelCoordinatesFromEvent(event, this._domElement);
      this._mouseDragInfo = new MouseDragInfo(position);
    } else if (isTouch(event)) {
      this.updateTouchEvents(event);
      this.onTouchDown(event);
    }
  }

  public async onPointerDrag(event: PointerEvent, leftButton: boolean): Promise<void> {
    if (!this._mouseDragInfo || !this.isEnabled || !isMouse(event)) {
      return;
    }
    const position = getPixelCoordinatesFromEvent(event, this._domElement);
    const deltaPosition = position.clone().sub(this._mouseDragInfo.prevPosition);
    if (deltaPosition.x == 0 && deltaPosition.y == 0) {
      return;
    }
    let { translator } = this._mouseDragInfo;

    if (!this.isStationary && this._keyboard.isShiftPressedOnly()) {
      translator = undefined;
      // Zooming forward and backward
      deltaPosition.multiplyScalar(this._options.mouseDollySpeed);
      this.pan(0, 0, deltaPosition.y);
    } else if (!this.isStationary && (!leftButton || this._keyboard.isCtrlPressedOnly())) {
      // Pan left, right, up or down
      if (!translator) {
        translator = new FlexibleControlsTranslator(this);
        await translator.initialize(position);
      }
      if (!translator.translate(position)) {
        // If not, translate in a simpler way
        deltaPosition.multiplyScalar(this._options.mousePanSpeed);
        this.pan(deltaPosition.x, deltaPosition.y, 0);
      }
    } else if (leftButton) {
      translator = undefined;
      this.rotate(deltaPosition);
    }
    this._mouseDragInfo.update(position, translator);
  }

  public onPointerUp(event: PointerEvent, _leftButton: boolean): void {
    this._mouseDragInfo = undefined;
    if (!isTouch(event)) {
      return;
    }
    this.removeTouchEvent(event);
  }

  public readonly onKeyDown = (event: KeyboardEvent): void => {
    if (!this.isEnabled) {
      return;
    }
    if (this.isStationary) {
      return;
    }
    if (!this.options.enableChangeControlsTypeOn123Key) {
      return;
    }
    if (event.code === 'Digit1') {
      this.setControlsType(FlexibleControlsType.Orbit);
    } else if (event.code === 'Digit2') {
      this.setControlsType(FlexibleControlsType.FirstPerson);
    } else if (event.code === 'Digit3') {
      this.setControlsType(FlexibleControlsType.OrbitInCenter);
    }
  };

  public onFocusChanged(_haveFocus: boolean): void {
    this._keyboard.clearPressedKeys();
  }

  public onKey(event: KeyboardEvent, down: boolean): void {
    if (!this.isEnabled) {
      return;
    }
    if (down) {
      this.onKeyDown(event);
    }
    this._keyboard.onKey(event, down);
  }

  public readonly onWheelHandler = async (event: WheelEvent): Promise<void> => {
    if (!this.isEnabled) {
      return;
    }
    this.onWheel(event, getWheelEventDelta(event));
  };

  public async onWheel(event: WheelEvent, delta: number): Promise<void> {
    if (!this.isEnabled) {
      return;
    }
    event.preventDefault();
    const pixelCoords = getPixelCoordinatesFromEvent(event, this._domElement);

    await this.setScrollCursorByWheelEventCoords(pixelCoords);

    if (this._camera instanceof PerspectiveCamera) {
      const normalizedCoords = this.getNormalizedPixelCoordinates(pixelCoords);
      if (this.isStationary) {
        const deltaDistance = delta * this.options.wheelDollySpeed;
        this.zoomCameraByFov(normalizedCoords, deltaDistance);
      } else {
        const deltaDistance = delta * this.getWheelSpeed();
        this.dollyWithWheelScroll(normalizedCoords, -deltaDistance);
      }
    } else if (this._camera instanceof OrthographicCamera) {
      const deltaDistance = Math.sign(delta) * this._options.orthographicCameraDollyFactor;
      this.dollyOrthographicCamera(deltaDistance);
    }
  }

  private readonly onContextMenu = (event: MouseEvent) => {
    if (!this.isEnabled) {
      return;
    }
    event.preventDefault();
  };

  //================================================
  // INSTANCE METHODS: Operations
  //================================================

  public addEventListeners(): void {
    this._keyboard.addEventListeners(this._domElement);
    this._domElement.addEventListener('keydown', this.onKeyDown);
    this._domElement.addEventListener('wheel', this.onWheelHandler);
    this._domElement.addEventListener('contextmenu', this.onContextMenu);
  }

  public removeEventListeners(): void {
    this._listeners.removeEventListeners();
    this._keyboard.removeEventListeners(this._domElement);
    this._domElement.removeEventListener('keydown', this.onKeyDown);
    this._domElement.removeEventListener('wheel', this.onWheelHandler);
    this._domElement.removeEventListener('contextmenu', this.onContextMenu);
  }

  //================================================
  // INSTANCE METHODS: Updating the camera
  //================================================

  public updateCameraAndTriggerCameraChangeEvent(): void {
    // Call this when manually update the target, cameraVector or cameraPosition
    // This update the camera without damping
    if (!this.updateCamera(1000 / TARGET_FPS, true, true)) {
      this.listeners.dispatchEvent('cameraChange', this); // Force trigger if not done in updateCamera
    }
  }

  public updateCamera(deltaTimeS: number, forceUpdate = false, useDampening = true): boolean {
    if (!forceUpdate && !this.isEnabled) {
      return false;
    }
    this.handleKeyboard(deltaTimeS);

    const isRotated = this._cameraVector.isChanged(RAD_EPSILON);
    const isChange = isRotated || this._target.isChanged(XYZ_EPSILON) || this._cameraPosition.isChanged(XYZ_EPSILON);
    const dampeningFactor = useDampening ? this.getDampingFactor(deltaTimeS) : 1;

    if (isChange && dampeningFactor < 1) {
      this._cameraVector.damp(dampeningFactor);
      if (isRotated) {
        this._cameraPosition.dampAsVectorAndCenter(dampeningFactor, this._target);
      } else {
        this._target.damp(dampeningFactor);
        this._cameraPosition.damp(dampeningFactor);
      }
    } else {
      this._cameraVector.synchronize();
      this._target.synchronize();
      this._cameraPosition.synchronize();
    }
    this._camera.position.copy(this._cameraPosition.value);
    this._camera.updateProjectionMatrix();

    this._camera.lookAt(this.getLookAt());
    this._camera.updateProjectionMatrix();
    if (!isChange) {
      return false;
    }
    this.listeners.dispatchEvent('cameraChange', this);
    return true; // Tell caller if camera has changed
  }

  //================================================
  // INSTANCE METHODS: Rotate
  //================================================

  private rotate(delta: Vector2) {
    if (delta.x === 0 && delta.y === 0) {
      return;
    }
    let deltaAzimuthAngle = this._options.mouseRotationSpeedAzimuth * delta.x;
    let deltaPolarAngle = this._options.mouseRotationSpeedPolar * delta.y;
    // It is more natural that the first person rotate slower then the other modes
    if (this.isStationary || this.controlsType == FlexibleControlsType.FirstPerson) {
      deltaAzimuthAngle *= 0.5;
      deltaPolarAngle *= 0.5;
    }
    deltaAzimuthAngle *= 0.5 + 0.5 * this.getAzimuthCompensationFactor();
    this.rotateByAngles(deltaAzimuthAngle, deltaPolarAngle);
  }

  public getAzimuthCompensationFactor(): number {
    // Calculate the azimuth compensation factor. This adjusts the azimuth rotation
    // to make it feel more natural when looking straight up or straight down.
    return Math.abs(Math.sin(this._cameraVector.end.phi));
  }

  public rotateByAngles(deltaAzimuth: number, deltaPolar: number): void {
    if (deltaAzimuth === 0 && deltaPolar === 0) {
      return;
    }
    this._rotationHelper.begin(this);
    this.rawRotateByAngles(-deltaAzimuth, deltaPolar);
    this._rotationHelper.end(this);
  }

  private rawRotateByAngles(deltaAzimuth: number, deltaPolar: number) {
    this._cameraVector.end.theta = this.options.getLegalAzimuthAngle(this._cameraVector.end.theta + deltaAzimuth);
    this._cameraVector.end.phi = this.options.getLegalPolarAngle(this._cameraVector.end.phi + deltaPolar);
    this._cameraVector.end.makeSafe();
  }

  //================================================
  // INSTANCE METHODS: Touch events
  //================================================

  private onTouchDown(event: PointerEvent) {
    switch (this.touchEventsCount) {
      case 1:
        this.startTouchRotation(event);
        break;

      case 2:
        if (!this.isStationary) {
          this.startTouchPinch();
        }
        break;

      default:
        break;
    }
  }

  private startTouchRotation(initialEvent: PointerEvent) {
    let prevPosition = getPixelCoordinatesFromEvent(initialEvent, this._domElement);

    const isOk = () => this.touchEventsCount === 1;

    const onMove = (event: PointerEvent) => {
      this.updateTouchEvents(event);
      if (!isOk()) {
        removeEventListeners();
        return;
      }
      const position = getPixelCoordinatesFromEvent(event, this._domElement);
      this.rotate(new Vector2().subVectors(position, prevPosition));
      prevPosition = position;
    };

    const onDown = (_event: PointerEvent) => {
      // if num fingers used don't equal 1 then we stop touch rotation
      if (!isOk()) {
        removeEventListeners();
      }
    };

    const onUp = (_event: PointerEvent) => {
      removeEventListeners();
    };

    const removeEventListeners = () => {
      this._domElement.removeEventListener('pointerdown', onDown);
      this._domElement.removeEventListener('pointerup', onUp);
      this._domElement.removeEventListener('pointermove', onMove);
    };

    this._domElement.addEventListener('pointerdown', onDown);
    this._domElement.addEventListener('pointerup', onUp);
    this._domElement.addEventListener('pointermove', onMove);
  }

  private startTouchPinch() {
    let previousInfo = getPinchInfo(this._domElement, this._touchEvents);

    const isOk = () => this.touchEventsCount === 2;

    const onMove = (event: PointerEvent) => {
      this.updateTouchEvents(event);
      if (!isOk()) {
        removeEventListeners();
        return;
      }
      const info = getPinchInfo(this._domElement, this._touchEvents);

      // dolly
      const deltaDistance = 0.1 * this._options.sensitivity * (info.distance - previousInfo.distance);
      const translation = this.getTranslationByDirection(new Vector2(0, 0), deltaDistance);
      this.translate(translation);

      // pan
      const deltaPosition = new Vector2().subVectors(info.center, previousInfo.center);
      if (deltaPosition.length() > this._options.pinchEpsilon) {
        deltaPosition.multiplyScalar(this._options.pinchPanSpeed);
        this.pan(deltaPosition.x, deltaPosition.y, 0);
      }
      previousInfo = info;
    };

    const onDown = (_event: PointerEvent) => {
      if (!isOk()) {
        removeEventListeners();
      }
    };

    const onUp = (_event: PointerEvent) => {
      removeEventListeners();
    };

    const removeEventListeners = () => {
      this._domElement.removeEventListener('pointerdown', onDown);
      this._domElement.removeEventListener('pointermove', onMove);
      this._domElement.removeEventListener('pointerup', onUp);
    };

    this._domElement.addEventListener('pointerdown', onDown);
    this._domElement.addEventListener('pointermove', onMove);
    this._domElement.addEventListener('pointerup', onUp);
  }

  private get touchEventsCount(): number {
    return this._touchEvents.length;
  }

  private removeTouchEvent(event: PointerEvent) {
    remove(this._touchEvents, ev => ev.pointerId === event.pointerId);
  }

  private updateTouchEvents(event: PointerEvent) {
    // Find this event in the cache and update its record with this event
    const index = this._touchEvents.findIndex(e => e.pointerId === event.pointerId);
    if (index >= 0) {
      this._touchEvents[index] = event;
    } else {
      this._touchEvents.push(event);
    }
  }

  //================================================
  // INSTANCE METHODS: Pan
  //================================================

  private pan(deltaX: number, deltaY: number, deltaZ: number, keys = false) {
    // Local function:
    const panByDimension = (distance: number, dimension: number, vertical: boolean) => {
      const delta = newVector3();
      delta.setFromMatrixColumn(this._camera.matrix, dimension);
      if (keys) {
        if (vertical) {
          delta.x = 0;
          delta.z = 0;
        } else {
          delta.y = 0;
        }
      }
      delta.normalize();
      delta.multiplyScalar(-distance);
      this.translate(delta);
    };
    // Do the actual panning:
    const factor = this.getPanFactor();
    if (deltaX !== 0) panByDimension(+factor * deltaX, 0, false); // Side to side
    if (deltaY !== 0) panByDimension(-factor * deltaY, 1, true); // Up and down
    if (deltaZ !== 0) panByDimension(+factor * deltaZ, 2, false); // Forward and backward
  }

  public translate(delta: Vector3): void {
    if (delta.manhattanLength() === 0) return;
    if (this.controlsType === FlexibleControlsType.OrbitInCenter) {
      this._target.end.add(delta);
    }
    this._cameraPosition.end.add(delta);
  }

  //================================================
  // INSTANCE METHODS: Dolly/Zoom
  //================================================

  private dollyOrthographicCamera(deltaDistance: number) {
    const camera = this._camera as OrthographicCamera;
    if (!camera) return;
    camera.zoom *= 1 - deltaDistance;
    camera.zoom = MathUtils.clamp(camera.zoom, this._options.minOrthographicZoom, this._options.maxOrthographicZoom);
    camera.updateProjectionMatrix();
  }

  private dollyWithWheelScroll(pixelCoordinates: Vector2, deltaDistance: number) {
    const translation = this.getTranslation(pixelCoordinates, deltaDistance);
    this.translate(translation);
  }

  private getTranslation(pixelCoordinates: Vector2, deltaDistance: number): Vector3 {
    if (this.options.shouldPick) {
      return this.getTranslationByScrollCursor(pixelCoordinates, deltaDistance);
    }
    return this.getTranslationByDirection(new Vector2(0, 0), deltaDistance);
  }

  private getTranslationByDirection(pixelCoordinates: Vector2, deltaDistance: number): Vector3 {
    const raycaster = new Raycaster();
    raycaster.setFromCamera(pixelCoordinates, this._camera);
    const translation = raycaster.ray.direction;
    translation.normalize();
    translation.multiplyScalar(deltaDistance);
    return translation;
  }

  private getTranslationByScrollCursor(pixelCoordinates: Vector2, deltaDistance: number): Vector3 {
    if (this._scrollDirection === undefined) {
      return this.getTranslationByDirection(pixelCoordinates, deltaDistance);
    }
    const step = this.getStep(deltaDistance);
    this._scrollDistance -= step;
    const translation = this._scrollDirection.clone();

    translation.multiplyScalar(step);
    return translation;
  }

  private getStep(deltaDistance: number): number {
    const step = this.options.zoomFraction * this._scrollDistance * Math.sign(deltaDistance);
    if (this.options.realMouseWheelAction === FlexibleWheelZoomType.PastCursor) {
      const minStep = Math.abs(deltaDistance * 0.5);
      if (Math.abs(step) < minStep) {
        // If past or near the scroll cursor, go in equal steps
        return minStep * Math.sign(deltaDistance);
      }
    }
    if (this.options.realMouseWheelAction === FlexibleWheelZoomType.ToCursor) {
      if (deltaDistance > 0 && this._scrollDistance - step < this.options.sensitivity) {
        // This avoid to close to the scroll cursor
        // Can not get closer than options.sensitivity
        return Math.max(0, this._scrollDistance - this.options.sensitivity);
      }
    }
    return step;
  }

  private zoomCameraByFov(normalizedCoords: Vector2, delta: number) {
    // Added to prevent browser scrolling when zooming
    if (!(this._camera instanceof PerspectiveCamera)) {
      return;
    }
    const preCursorRay = getCursorRay(this._camera, normalizedCoords);
    if (!this.setFov(this.fov + delta, false)) {
      return;
    }
    // When zooming the camera is rotated towards the cursor position
    const postCursorRay = getCursorRay(this._camera, normalizedCoords);
    const arcBetweenRays = new Quaternion().setFromUnitVectors(postCursorRay, preCursorRay);
    const forwardVector = this.cameraVector.getEndVector();

    forwardVector.applyQuaternion(arcBetweenRays);
    this._cameraVector.copy(forwardVector);
    this.listeners.dispatchEvent('cameraChange', this);

    function getCursorRay(camera: PerspectiveCamera, normalizedCoords: Vector2) {
      const ray = new Vector3(normalizedCoords.x, normalizedCoords.y, 1)
        .unproject(camera)
        .sub(camera.position)
        .normalize();
      return ray;
    }
  }

  private async setScrollCursorByWheelEventCoords(currentCoords: Vector2): Promise<void> {
    if (!this.options.shouldPick || this.isStationary || !this.getPickedPointByPixelCoordinates) {
      return;
    }
    const currentTime = performance.now();
    const deltaTime = currentTime - this._prevTime;
    const deltaCoords = currentCoords.distanceTo(this._prevCoords);

    if (deltaTime <= this.options.minimumTimeBetweenRaycasts) {
      return;
    }
    const timeHasChanged = deltaTime >= this.options.maximumTimeBetweenRaycasts;
    const positionHasChanged = deltaCoords >= this.options.mouseDistanceThresholdBetweenRaycasts;
    if (!positionHasChanged || !timeHasChanged) {
      return;
    }
    this._prevTime = currentTime;
    this._prevCoords.copy(currentCoords);

    const scrollCursor = await this.getPickedPointByPixelCoordinates(currentCoords);
    this.setScrollCursor(scrollCursor);
    this._prevTime = currentTime;
    return;
  }

  //================================================
  // INSTANCE METHODS: Keyboard
  //================================================

  private handleKeyboard(deltaTimeS: number): boolean {
    if (!this._isEnabled) {
      return false;
    }
    if (!this._options.enableKeyboardNavigation) {
      return false;
    }
    if (this.temporarlyDisableKeyboard) {
      return false;
    }
    let handled = false;
    const timeScale = getTimeScale(deltaTimeS);
    if (this.handleRotationFromKeyboard(timeScale)) {
      handled = true;
    }
    if (!this.isStationary && this.handleMoveFromKeyboard(timeScale)) {
      handled = true;
    }
    return handled;
  }

  private handleRotationFromKeyboard(timeScale: number): boolean {
    const speedFactor = this._keyboard.isShiftPressed() ? this._options.keyboardFastRotationFactor : 1;

    const deltaAzimuthAngle =
      this._options.keyboardRotationSpeedAzimuth *
      speedFactor *
      this._keyboard.getKeyboardMovementValue('ArrowLeft', 'ArrowRight') *
      timeScale;

    const deltaPolarAngle =
      this._options.keyboardRotationSpeedPolar *
      speedFactor *
      this._keyboard.getKeyboardMovementValue('ArrowUp', 'ArrowDown') *
      timeScale;

    if (deltaAzimuthAngle === 0 && deltaPolarAngle === 0) {
      return false;
    }
    this.rotateByAngles(-deltaAzimuthAngle, -deltaPolarAngle);
    return true;
  }

  private handleMoveFromKeyboard(timeScale: number): boolean {
    const deltaX = this._keyboard.getKeyboardMovementValue('KeyA', 'KeyD');
    const deltaY = this._keyboard.getKeyboardMovementValue('KeyE', 'KeyQ');
    const deltaZ = this._keyboard.getKeyboardMovementValue('KeyW', 'KeyS');

    if (deltaX === 0 && deltaY === 0 && deltaZ === 0) {
      return false;
    }
    if (!this.isStationary) {
      this.setControlsType(FlexibleControlsType.FirstPerson);
    }
    const keyboardSpeed = this._options.getKeyboardSpeed(this._keyboard.isShiftPressed());
    const speedXY = timeScale * keyboardSpeed * this._options.keyboardPanSpeed;
    const speedZ = timeScale * keyboardSpeed * this._options.keyboardDollySpeed;

    this.pan(speedXY * deltaX, speedXY * deltaY, speedZ * deltaZ, true);
    return true;
  }
}

//================================================
// LOCAL FUNCTIONS
//================================================

function getPinchInfo(domElement: HTMLElement, touches: PointerEvent[]) {
  if (touches.length !== 2) {
    throw new Error('getPinchInfo only works if touches.length === 2');
  }
  const positions = touches.map(event => getPixelCoordinatesFromEvent(event, domElement));
  const center = new Vector2().addVectors(positions[0], positions[1]).multiplyScalar(0.5);
  const distance = positions[0].distanceTo(positions[1]);
  return { center, distance };
}

/**
 * Converts deltaTimeS to a time scale based on the target frames per second (FPS).
 *
 * @param deltaTimeS - The elapsed time since the last frame in seconds.
 * @returns The time scale, which is a factor representing the relationship of deltaTimeS to the target FPS.
 */
function getTimeScale(deltaTimeS: number): number {
  return deltaTimeS * TARGET_FPS;
}

function isMouse(event: PointerEvent): boolean {
  return event.pointerType === 'mouse';
}

function isTouch(event: PointerEvent): boolean {
  return event.pointerType === 'touch';
}

// helper class from mouseDown, mouseMove and mouseUp
// It keeps track of the previous position and how it is translated
class MouseDragInfo {
  public constructor(prevPosition: Vector2) {
    this.prevPosition = prevPosition;
  }
  public update(prevPosition: Vector2, translator: FlexibleControlsTranslator | undefined): void {
    this.prevPosition.copy(prevPosition);
    this.translator = translator;
  }
  public readonly prevPosition: Vector2;
  public translator: FlexibleControlsTranslator | undefined = undefined;
}

// ==================================================
// PRIVATE FUNCTIONS: Vector pool
// ==================================================

const VECTOR_POOL = new Vector3Pool();
function newVector3(copyFrom?: Vector3): Vector3 {
  return VECTOR_POOL.getNext(copyFrom);
}
