/*!
 * Copyright 2024 Cognite AS
 */

import remove from 'lodash/remove';
import {
  EventDispatcher,
  MathUtils,
  MOUSE,
  OrthographicCamera,
  PerspectiveCamera,
  Quaternion,
  Raycaster,
  Spherical,
  Vector2,
  Vector3
} from 'three';
import Keyboard from '../Keyboard';
import { getNormalizedPixelCoordinates, getClickOrTouchEventPoint } from '@reveal/utilities';
import { FlexibleControlsType } from './FlexibleControlsType';
import { FlexibleControlsOptions } from './FlexibleControlsOptions';
import { FlexibleWheelZoomType } from './FlexibleWheelZoomType';
import { DampedVector3 } from './DampedVector3';
import { DampedSpherical } from './DampedSpherical';
import { ReusableVector3s } from './ReusableVector3s';
import { FlexibleControlsEvent } from './FlexibleControlsEvent';
import { GetPickedPointByPixelCoordinates } from './GetPickedPointByPixelCoordinates';
import { FlexibleControlsTranslator } from './FlexibleControlsTranslator';
import { FlexibleControlsRotationHelper } from './FlexibleControlsRotationHelper';
import { getWheelDelta } from '../utils/getWheelDelta';

const TARGET_FPS = 30;
const XYZ_EPSILON = 0.001; // Used for points
const RAD_EPSILON = Math.PI / 10000; // Used for angles

/**
 * @beta
 */
export class FlexibleControls extends EventDispatcher<FlexibleControlsEvent> {
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

  private readonly _keyboard: Keyboard;
  private readonly _touchEvents: Array<PointerEvent> = [];
  private _getPickedPointByPixelCoordinates: GetPickedPointByPixelCoordinates | undefined;

  // This is a hack for overcome problems with the setting the Quaternion direction.
  // This is normally done in animation of movements using setCameraState,
  // which arguments does not fit into this control. (no direction is given for instance)
  private _rawCameraRotation: Quaternion | undefined = undefined;

  // Temporary objects used for calculations to avoid allocations
  private readonly _reusableVector3s = new ReusableVector3s();
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
    super();

    if (camera) {
      this._camera = camera;
      options.defaultFov = this.fov;
    } else {
      this._camera = new PerspectiveCamera(options.defaultFov, undefined, 0.1, 10000);
    }
    this._domElement = domElement;
    this._options = options;
    this._keyboard = new Keyboard(this._domElement);
    this._cameraVector.copy(new Vector3(1, 0, 0));
  }

  public dispose(): void {
    this.removeEventListeners();
    this._keyboard.dispose();
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
  // INSTANCE METHODS: Pulic getters and setters
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
    return this.newVector3().addVectors(this._cameraPosition.value, this._cameraVector.getValueVector());
  }

  public getState(): { target: Vector3; position: Vector3 } {
    return {
      target: this.getTarget(),
      position: this._camera.position.clone()
    };
  }

  private getMousePosition(event: PointerEvent): Vector2 {
    return getMousePosition(this._domElement, event.clientX, event.clientY);
  }

  public getNormalizedPixelCoordinates(event: PointerEvent): Vector2 {
    return getNormalizedPixelCoordinates(this._domElement, event.clientX, event.clientY);
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
      this.triggerCameraChangeEvent();
    }
    return true;
  }

  public setPositionAndTarget(position: Vector3, target: Vector3): void {
    this.isInitialized = true;
    this._cameraPosition.copy(position);
    this._target.copy(target);

    // CameraVector = Target - Position
    const vector = this.newVector3().subVectors(target, position);
    vector.normalize();
    this._cameraVector.copy(vector);
    this._rawCameraRotation = undefined;
    this.updateCameraAndTriggerCameraChangeEvent();
  }

  public setPosition(position: Vector3): void {
    this._cameraPosition.copy(position);
    this._rawCameraRotation = undefined;
    this.updateCameraAndTriggerCameraChangeEvent();
  }

  public setPositionAndDirection(position: Vector3, direction: Vector3): void {
    this.isInitialized = true;
    this._cameraPosition.copy(position);
    this._cameraVector.copy(direction);
    this._rawCameraRotation = undefined;

    this.updateCameraAndTriggerCameraChangeEvent();
  }

  public setPositionAndRotation(position: Vector3, rotation: Quaternion): void {
    this.isInitialized = true;
    this._cameraPosition.copy(position);

    const cameraVector = this.newVector3().set(0, 0, -1);
    cameraVector.applyQuaternion(rotation);

    this._rawCameraRotation = rotation.clone();

    if (DampedSpherical.isVertical(cameraVector)) {
      // Looking from top or bottom, the theta must be defined in a proper way
      const upVector = this.newVector3().set(0, 1, 0);
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
    this.triggerControlsTypeChangeEvent();

    // This shouldn't be here, but RevealManager listen to this in order to do a redraw
    // Cannot triggerControlsTypeChangeEvent since it is not part of the predefined general events
    // The scene must be redrawn because of the markers
    this.triggerCameraChangeEvent();
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

  private newVector3(): Vector3 {
    return this._reusableVector3s.getNext();
  }

  //================================================
  // INSTANCE METHODS: Public operations
  //================================================

  public update(deltaTimeS: number, forceUpdate = false): boolean {
    return this.updateCamera(deltaTimeS, forceUpdate);
  }

  public triggerCameraChangeEvent(): void {
    this.dispatchEvent({
      type: 'cameraChange',
      content: {
        position: this._camera.position,
        target: this._target.value
      }
    });
  }

  public triggerControlsTypeChangeEvent(): void {
    this.dispatchEvent({
      type: 'controlsTypeChange',
      controlsType: this.options.controlsType
    });
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

  private readonly onKeyDown = (event: KeyboardEvent) => {
    if (!this.isEnabled || this.isStationary) {
      return;
    }
    if (!this.options.enableChangeControlsTypeOn123Key) {
      return;
    }
    if (event.code === 'Digit1') {
      return this.setControlsType(FlexibleControlsType.Orbit);
    } else if (event.code === 'Digit2') {
      return this.setControlsType(FlexibleControlsType.FirstPerson);
    } else if (event.code === 'Digit3') {
      return this.setControlsType(FlexibleControlsType.OrbitInCenter);
    }
  };

  public readonly onPointerDown = async (event: PointerEvent): Promise<void> => {
    if (!this.isEnabled) {
      return;
    }
    if (isMouse(event)) {
      await this.onMouseDown(event);
    } else if (isTouch(event)) {
      this.onTouchStart(event);
    }
  };

  private async onMouseDown(event: PointerEvent) {
    if (!this.isEnabled) {
      return;
    }
    this._cameraVector.synchronizeEnd();
    switch (event.button) {
      case MOUSE.LEFT:
        break;

      case MOUSE.RIGHT:
        event.preventDefault();
        break;

      default:
        return;
    }
    const mouseDragInfo = new MouseDragInfo(
      getMousePosition(this._domElement, event.clientX, event.clientY),
      event.button === MOUSE.RIGHT
    );
    this._mouseDragInfo = mouseDragInfo;
  }

  private readonly onPointerMove = async (event: PointerEvent) => {
    if (!this._mouseDragInfo || !this.isEnabled || !isMouse(event)) {
      return;
    }
    if (!isPressed(event)) {
      if (this._mouseDragInfo) {
        // No buttons is pressed, and still in mouse dragging, issue a onPointerUp()
        // This can happend when you move the mouse outside the window and release the mouse button
        // It shouldn't, but it is dependent of the context where the viewer is used.
        this.onPointerUp(event);
      }
      return;
    }
    this.onPointerDrag(event);
  };

  private readonly onPointerDrag = async (event: PointerEvent) => {
    if (!this._mouseDragInfo || !this.isEnabled || !isMouse(event)) {
      return;
    }
    const position = this.getMousePosition(event);
    const deltaPosition = position.clone().sub(this._mouseDragInfo.prevPosition);
    if (deltaPosition.x == 0 && deltaPosition.y == 0) {
      return;
    }
    const { isRight } = this._mouseDragInfo;
    let { translator } = this._mouseDragInfo;

    if (!this.isStationary && this._keyboard.isShiftPressedOnly()) {
      translator = undefined;
      // Zooming forward and backward
      deltaPosition.multiplyScalar(this._options.mouseDollySpeed);
      this.pan(0, 0, deltaPosition.y);
    } else if (!this.isStationary && (isRight || this._keyboard.isCtrlPressedOnly())) {
      // Pan left, right, up or down
      if (!translator) {
        translator = new FlexibleControlsTranslator(this);
        await translator.initialize(event);
      }
      if (!translator.translate(event)) {
        // If not, translate in a simpler way
        deltaPosition.multiplyScalar(this._options.mousePanSpeed);
        this.pan(deltaPosition.x, deltaPosition.y, 0);
      }
    } else if (!isRight) {
      translator = undefined;
      this.rotate(deltaPosition);
    }
    this._mouseDragInfo.update(position, translator);
  };

  public readonly onPointerUp = (event: PointerEvent): void => {
    this._mouseDragInfo = undefined;
    if (isTouch(event)) {
      remove(this._touchEvents, ev => ev.pointerId === event.pointerId);
    }
  };

  public readonly onMouseWheel = async (event: WheelEvent): Promise<void> => {
    if (!this.isEnabled) {
      return;
    }
    // Added because cameraControls are disabled when doing picking, so
    // preventDefault could be not called on wheel event and produce unwanted scrolling.
    event.preventDefault();

    await this.setScrollCursorByWheelEvent(event);

    const delta = getWheelDelta(event);
    if (this._camera instanceof PerspectiveCamera) {
      const pixelCoords = getClickOrTouchEventPoint(event, this._domElement);
      const normalizedCoords = getNormalizedPixelCoordinates(this._domElement, pixelCoords.x, pixelCoords.y);
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
  };

  private onTouchStart(event: PointerEvent) {
    if (!this.isEnabled) return;
    this._touchEvents.push(event);
    event.preventDefault();
    this._cameraVector.synchronizeEnd();

    switch (this._touchEvents.length) {
      case 1:
        this.startTouchRotation(event);
        break;

      case 2:
        if (!this.isStationary) {
          this.startTouchPinch(event);
        }
        break;

      default:
        break;
    }
  }

  private readonly onFocusChanged = (event: MouseEvent | TouchEvent | FocusEvent) => {
    if (!this.isEnabled) return;
    if (event.type === 'focus') {
      this._keyboard.clearPressedKeys();
    }
  };

  private readonly onContextMenu = (event: MouseEvent) => {
    if (!this.isEnabled) return;
    event.preventDefault();
  };

  //================================================
  // INSTANCE METHODS: Operations
  //================================================

  public addEventListeners(): void {
    this._domElement.addEventListener('keydown', this.onKeyDown);
    this._domElement.addEventListener('pointerdown', this.onPointerDown);
    this._domElement.addEventListener('wheel', this.onMouseWheel);
    this._domElement.addEventListener('contextmenu', this.onContextMenu);

    // canvas has focus by default, but it's possible to set tabindex on it,
    // in that case events will be fired (we don't set tabindex here, but still support that case)
    this._domElement.addEventListener('focus', this.onFocusChanged);

    // These must be on the window
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
  }

  public removeEventListeners(): void {
    this._domElement.removeEventListener('keydown', this.onKeyDown);
    this._domElement.removeEventListener('pointerdown', this.onPointerDown);
    this._domElement.removeEventListener('wheel', this.onMouseWheel);
    this._domElement.removeEventListener('contextmenu', this.onContextMenu);
    this._domElement.removeEventListener('focus', this.onFocusChanged);
    this._domElement.removeEventListener('pointerdown', this.onFocusChanged);

    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
  }

  //================================================
  // INSTANCE METHODS: Updating the camera
  //================================================

  public updateCameraAndTriggerCameraChangeEvent(): void {
    // Call this when manually update the target, cameraVector or cameraPosition
    // This update the camera without damping
    if (!this.updateCamera(1000 / TARGET_FPS, true, true)) {
      this.triggerCameraChangeEvent(); // Force trigger if not done in updateCamera
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

    if (this._rawCameraRotation) {
      this._camera.setRotationFromQuaternion(this._rawCameraRotation);
      this._camera.updateProjectionMatrix();
    } else {
      this._camera.lookAt(this.getLookAt());
      this._camera.updateProjectionMatrix();
    }
    if (!isChange) {
      return false;
    }
    this.triggerCameraChangeEvent();
    return true; // Tell caller if camera has changed
  }

  //================================================
  // INSTANCE METHODS: Rotate
  //================================================

  private startTouchRotation(initialEvent: PointerEvent) {
    let prevPosition = getMousePosition(this._domElement, initialEvent.clientX, initialEvent.clientY);

    const onTouchMove = (event: PointerEvent) => {
      if (!this.isEnabled) return;
      if (this._touchEvents.length !== 1) {
        return;
      }
      const position = this.getMousePosition(event);
      this.rotate(new Vector2().subVectors(position, prevPosition));
      prevPosition = position;
    };

    const onTouchStart = (_event: PointerEvent) => {
      if (!this.isEnabled) return;
      // if num fingers used don't equal 1 then we stop touch rotation
      if (this._touchEvents.length !== 1) {
        removeEventListeners();
      }
    };

    const onTouchEnd = () => {
      removeEventListeners();
    };

    const removeEventListeners = () => {
      this._domElement.removeEventListener('pointerdown', onTouchStart);
      this._domElement.removeEventListener('pointerup', onTouchEnd);
      document.removeEventListener('pointermove', onTouchMove);
    };

    this._domElement.addEventListener('pointerdown', onTouchStart);
    this._domElement.addEventListener('pointerup', onTouchEnd, { passive: false });
    document.addEventListener('pointermove', onTouchMove, { passive: false });
  }

  private rotate(delta: Vector2) {
    if (delta.x === 0 && delta.y === 0) {
      return;
    }
    let deltaAzimuthAngle = this._options.mouseRotationSpeedAzimuth * delta.x;
    let deltaPolarAngle = this._options.mouseRotationSpeedPolar * delta.y;
    // It is more natural that the first persion rotate slower then the other modes
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
  // INSTANCE METHODS: Pinch
  //================================================

  private startTouchPinch(initialEvent: PointerEvent) {
    this.replaceTouchEvent(initialEvent);
    let previousInfo = getPinchInfo(this._domElement, this._touchEvents);

    const onTouchMove = (event: PointerEvent) => {
      if (this._touchEvents.length !== 2) {
        return;
      }
      this.replaceTouchEvent(event);
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

    const onTouchStart = (_event: PointerEvent) => {
      // if num fingers used don't equal 2 then we stop touch pinch
      if (this._touchEvents.length !== 2) {
        removeEventListeners();
      }
    };

    const onTouchEnd = () => {
      removeEventListeners();
    };

    const removeEventListeners = () => {
      document.removeEventListener('pointerdown', onTouchStart);
      document.removeEventListener('pointermove', onTouchMove);
      document.removeEventListener('pointerup', onTouchEnd);
    };

    document.addEventListener('pointerdown', onTouchStart);
    document.addEventListener('pointermove', onTouchMove);
    document.addEventListener('pointerup', onTouchEnd);
  }

  private replaceTouchEvent(event: PointerEvent) {
    // Find this event in the cache and update its record with this event
    const index = this._touchEvents.findIndex(cachedEvent => cachedEvent.pointerId === event.pointerId);
    this._touchEvents[index] = event;
  }
  //================================================
  // INSTANCE METHODS: Pan
  //================================================

  private pan(deltaX: number, deltaY: number, deltaZ: number, keys = false) {
    // Local function:
    const panByDimension = (distance: number, dimension: number, vertical: boolean) => {
      const delta = this.newVector3();
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
    this.triggerCameraChangeEvent();

    function getCursorRay(camera: PerspectiveCamera, normalizedCoords: Vector2) {
      const ray = new Vector3(normalizedCoords.x, normalizedCoords.y, 1)
        .unproject(camera)
        .sub(camera.position)
        .normalize();
      return ray;
    }
  }

  private async setScrollCursorByWheelEvent(event: WheelEvent): Promise<void> {
    if (!this.options.shouldPick || this.isStationary || !this.getPickedPointByPixelCoordinates) {
      return;
    }
    const currentCoords = getClickOrTouchEventPoint(event, this.domElement);
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

    const scrollCursor = await this.getPickedPointByPixelCoordinates(currentCoords.x, currentCoords.y);
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
    const deltaAzimuthAngle =
      this._options.keyboardRotationSpeedAzimuth *
      this._keyboard.getKeyboardMovementValue('ArrowLeft', 'ArrowRight') *
      timeScale;

    const deltaPolarAngle =
      this._options.keyboardRotationSpeedPolar *
      this._keyboard.getKeyboardMovementValue('ArrowUp', 'ArrowDown') *
      timeScale;

    if (deltaAzimuthAngle === 0 && deltaPolarAngle === 0) {
      return false;
    }
    if (!this.isStationary) {
      this.setControlsType(FlexibleControlsType.FirstPerson);
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
    const speedFactor = this._keyboard.isShiftPressed() ? this._options.keyboardFastMoveFactor : 1;
    const speedXY = timeScale * speedFactor * this._options.keyboardPanSpeed;
    const speedZ = timeScale * speedFactor * this._options.keyboardDollySpeed;

    this.pan(speedXY * deltaX, speedXY * deltaY, speedZ * deltaZ, true);
    return true;
  }
}

//================================================
// LOCAL FUNCTIONS
//================================================

function getMousePosition(domElement: HTMLElement, clientX: number, clientY: number): Vector2 {
  return new Vector2(clientX - domElement.offsetLeft, clientY - domElement.offsetTop);
}

function getPinchInfo(domElement: HTMLElement, touches: PointerEvent[]) {
  if (touches.length !== 2) {
    throw new Error('getPinchInfo only works if touches.length === 2');
  }
  const offsets = touches.map(({ clientX, clientY }) => getMousePosition(domElement, clientX, clientY));
  const center = new Vector2().addVectors(offsets[0], offsets[1]).multiplyScalar(0.5);
  const distance = offsets[0].distanceTo(offsets[1]);
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

export function isMouse(event: PointerEvent): boolean {
  return event.pointerType === 'mouse';
}

export function isTouch(event: PointerEvent): boolean {
  return event.pointerType === 'touch';
}

export function isPressed(event: PointerEvent): boolean {
  return event.buttons !== 0;
}

// helper class from mouseDown, mouseMove and mouseUp
// It keeps track of the previous position and how it is translated
class MouseDragInfo {
  public constructor(prevPosition: Vector2, isRight: boolean) {
    this.prevPosition = prevPosition;
    this.isRight = isRight;
  }
  public update(prevPosition: Vector2, translator: FlexibleControlsTranslator | undefined): void {
    this.prevPosition.copy(prevPosition);
    this.translator = translator;
  }
  public readonly prevPosition: Vector2;
  public readonly isRight: boolean = false;
  public translator: FlexibleControlsTranslator | undefined = undefined;
}
