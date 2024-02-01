/*!
 * Copyright 2021 Cognite AS
 */

import { clickOrTouchEventOffset } from '@reveal/utilities';
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
import Keyboard from './../Keyboard';
import { getNormalizedPixelCoordinates } from '@reveal/utilities';
import { ControlsType } from './ControlsType';
import { ComboControlsEventType } from './../ComboControls';
import { FlexibleControlsOptions } from './FlexibleControlsOptions';
import { WheelZoomType } from './WheelZoomType';
import { DampedVector3 } from './DampedVector3';
import { DampedSpherical } from './DampedSpherical';
import { ReusableVector3s } from './ReusableVector3s';

const IS_FIREFOX = navigator.userAgent.toLowerCase().indexOf('firefox') !== -1;
const TARGET_FPS = 30;

/**
 * @beta
 */
export class FlexibleControls extends EventDispatcher<ComboControlsEventType> {
  //================================================
  // INSTANCE FIELDS
  //================================================

  private _isEnabled: boolean = true;
  public temporarlyDisableKeyboard: boolean = false;

  private readonly _options: FlexibleControlsOptions;
  private readonly _domElement: HTMLElement;
  private readonly _camera: PerspectiveCamera | OrthographicCamera;

  // These are describe below in the ascii-art
  private readonly _target: DampedVector3 = new DampedVector3();
  private readonly _cameraVector: DampedSpherical = new DampedSpherical();

  // The Translation are used only if NOT the ControlsType.OrbitInCenter is enabled, it translates the camera
  // and the lookAt without changing the target or cameraVector.
  private readonly _translation = new DampedVector3();

  // Temporary used, undefined if not in use
  private _scrollDirection: Vector3 | undefined = undefined; // When using the wheel this is vector to the picked point from
  private _scrollDistance = 0; // When using the wheel this is vector to the picked point from
  private _tempTarget: Vector3 | undefined = undefined;

  private readonly _rawCameraRotation = new Quaternion();
  private readonly _accumulatedMouseRotation: Vector2 = new Vector2();
  private readonly _keyboard: Keyboard;
  private readonly _pointEventCache: Array<PointerEvent> = [];

  private readonly _reusableVector3s = new ReusableVector3s(); // Temporary objects used for calculations to avoid allocations

  //        ControlsType.OrbitInCenter
  //          , - ~ ~ ~ - ,
  //      , '               ' ,
  //    ,                       ,       In this state the camera always rotating round the target
  //   ,                         ,      which is in the center of the sceen.
  //  ,          Target           ,
  //  ,             *             ,     Translation is always (0,0,0)
  //  ,              \            ,
  //   ,  CameraVector\          ,
  //    ,              \        ,
  //      ,             \    , '
  //        ' - , _  _ , # CameraPosition
  //
  //
  //       ControlsType.Orbit
  //          , - ~ ~ ~ - ,
  //      , '               ' ,
  //    ,                       ,       Formula used are:
  //   ,                         ,      CameraVector = CameraPosition - Target - Translation
  //  ,          Target           ,     Target = CameraPosition - CameraVector - Translation
  //  ,             *             ,     CameraPosition = Target + Translation + CameraVector
  //  ,              \            ,
  //   ,  CameraVector\          ,      Translation is the translation vector between the center of the sceen to the target
  //    ,              \        ,
  //      ,             \    , '
  //        ' - , _  _ , #<---------------># CameraPosition
  //                         Translation
  //
  //      ControlsType.FirstPerson
  //          , - ~ ~ ~ - ,
  //      , '               ' ,
  //    ,                       ,
  //   ,                         ,
  //  ,        CameraPosition     ,
  //  ,             *             ,
  //  ,              \            ,
  //   ,  CameraVector\          ,
  //    ,              \        ,
  //      ,             \    , '
  //        ' - , _  _ , #<---------------># Target
  //                         Translation
  //================================================
  // CONSTRUCTOR
  //================================================

  constructor(
    camera: PerspectiveCamera | OrthographicCamera,
    domElement: HTMLElement,
    options: FlexibleControlsOptions
  ) {
    super();
    this._camera = camera;
    this._domElement = domElement;
    this._options = options;
    this._keyboard = new Keyboard(this._domElement);
    this._cameraVector.copy(camera.position);
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

  get isEnabled(): boolean {
    return this._isEnabled;
  }

  set isEnabled(isEnabled: boolean) {
    this._isEnabled = isEnabled;
  }

  /**
   * Camera rotation to be used by the camera instead of target-based rotation.
   * This rotation is used only when set to non-default quaternion value (not identity rotation quaternion).
   * Externally, value is updated by `CameraManager` when `setState` method with non-zero rotation is called. Automatically
   * resets to default value when `setState` method is called with no rotation value.
   */
  get cameraRawRotation(): Quaternion {
    return this._rawCameraRotation;
  }

  public get controlsType(): ControlsType {
    return this.options.controlsType;
  }

  private get isTargetLocked(): boolean {
    return this.controlsType !== ControlsType.OrbitInCenter;
  }

  //================================================
  // INSTANCE METHODS: Pulic getters and setters
  //================================================

  public getTarget(): Vector3 {
    return this._target.value.clone();
  }

  public getLookAt(): Vector3 {
    if (this._tempTarget) {
      return this.newVector3().addVectors(this._tempTarget, this._translation.value);
    }
    if (this.isTargetLocked) {
      return this.newVector3().addVectors(this._target.value, this._translation.value);
    }
    return this._target.value;
  }

  public getLookAtEnd(): Vector3 {
    if (this._tempTarget) {
      return this.newVector3().addVectors(this._tempTarget, this._translation.end);
    }
    if (this.isTargetLocked) {
      return this.newVector3().addVectors(this._target.end, this._translation.end);
    }
    return this._target.value;
  }

  public getState(): { target: Vector3; position: Vector3 } {
    return {
      target: this.getTarget(),
      position: this._camera.position.clone()
    };
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

  public setState(position: Vector3, target: Vector3): void {
    this._translation.clear();
    this._target.copy(target);
    //this._scrollCursor.copy(target);

    // cameraVector = position - target
    const delta = position.clone().sub(target);
    this._cameraVector.copy(delta);

    this.update(1000 / TARGET_FPS, true);
    this.triggerCameraChangeEvent();
  }

  public setControlsType(controlsType: ControlsType): boolean {
    if (controlsType == this.options.controlsType) {
      return false;
    }
    this.options.controlsType = controlsType;
    if (controlsType === ControlsType.OrbitInCenter) {
      // This actually change target due to not change the camera position and lookAt
      this._target.add(this._translation);
      this._translation.clear();
      //this._scrollCursor.copy(this._target.value);
    }
    this.triggerCameraChangeEvent();
    return true;
  }

  //================================================
  // INSTANCE METHODS: Private Getters and setters
  //================================================

  private getCameraPosition(): Vector3 {
    const position = this._cameraVector.getVector().add(this._target.value); // CameraPosition = Target + CameraVector
    if (this.isTargetLocked) {
      position.add(this._translation.value);
    }
    return position;
  }

  private getPanFactor() {
    let speed = this._options.sensitivity;
    // The panning goes parallel to the screen, not perpendicular to the screen.
    // So we get y = x * tan (a), where y is parallel to the screen
    // half of the fov is center to top of screen
    if (this._camera instanceof PerspectiveCamera) {
      const fovFactor = Math.tan(MathUtils.degToRad(this._camera.fov / 2));
      speed *= fovFactor; // 0.57
    }
    const factor = 2 / this._domElement.clientHeight;
    speed *= factor; // 0.0015
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
    return Math.min(this._options.dampingFactor * targetFPSOverActualFPS, 1);
  }

  private newVector3(): Vector3 {
    return this._reusableVector3s.getNext();
  }

  //================================================
  // INSTANCE METHODS: Public operations
  //================================================

  public update(deltaTimeS: number, forceUpdate = false): boolean {
    if (!forceUpdate && !this.isEnabled) {
      return false;
    }
    if (this._accumulatedMouseRotation.lengthSq() > 2) {
      this.rotate(this._accumulatedMouseRotation);
      this._accumulatedMouseRotation.set(0, 0);
    }
    // Nils: Experiments with the timeScale to move smoothly
    const isKeyPressed = this.handleKeyboard(deltaTimeS);

    const epsilon = this._options.EPSILON;
    let isChanged = this._target.isChanged(epsilon) || this._cameraVector.isChanged(epsilon);

    if (this.isTargetLocked && !isChanged) {
      isChanged = this._translation.isChanged(epsilon);
    }
    if (isChanged) {
      const dampningFactor = isKeyPressed ? 1 : this.getDampingFactor(deltaTimeS);
      this._target.damp(dampningFactor);
      this._cameraVector.damp(dampningFactor);
      if (this.isTargetLocked) {
        this._translation.damp(dampningFactor);
      }
    } else {
      this._cameraVector.synchronize();
      this._target.synchronize();
      if (this.isTargetLocked) {
        this._translation.synchronize();
      }
    }
    this._camera.position.copy(this.getCameraPosition());

    if (isIdentityQuaternion(this._rawCameraRotation)) {
      this._camera.lookAt(this.getLookAt());
    } else {
      this._camera.setRotationFromQuaternion(this._rawCameraRotation);
    }
    if (isChanged) {
      this.triggerCameraChangeEvent();
    }
    // Tell caller if camera has changed
    return isChanged;
  }

  public triggerCameraChangeEvent = (): void => {
    this.dispatchEvent({
      type: 'cameraChange',
      camera: {
        position: this._camera.position,
        target: this._target.value
      }
    });
  };

  //================================================
  // INSTANCE METHODS: Event
  //================================================

  private readonly onPointerDown = (event: PointerEvent) => {
    if (!this.isEnabled) return;
    switch (event.pointerType) {
      case 'mouse':
        this.onMouseDown(event);
        break;
      case 'touch':
        this._pointEventCache.push(event);
        this.onTouchStart(event);
        break;
      default:
        break;
    }
  };
  private readonly onMouseDown = (event: PointerEvent) => {
    if (!this.isEnabled) return;
    this._cameraVector.synchronizeEnd();
    switch (event.button) {
      case MOUSE.LEFT: {
        this.startMouseRotation(event);
        break;
      }

      case MOUSE.RIGHT: {
        event.preventDefault();
        this.startMousePan(event);
        break;
      }

      default:
        break;
    }
  };

  private readonly onPointerUp = (event: PointerEvent) => {
    if (!this.isEnabled) return;
    switch (event.pointerType) {
      case 'mouse':
        this.onMouseUp();
        break;
      case 'touch':
        remove(this._pointEventCache, ev => ev.pointerId === event.pointerId);
        break;
      default:
        break;
    }
  };

  private readonly onMouseUp = () => {
    if (!this.isEnabled) return;
    this._accumulatedMouseRotation.set(0, 0);
  };

  private readonly onMouseWheel = (event: WheelEvent) => {
    if (!this.isEnabled) return;
    event.preventDefault();

    const delta = getWheelDelta(event);
    if (this._camera instanceof PerspectiveCamera) {
      const deltaDistance = delta * this.getWheelSpeed();
      const offset = clickOrTouchEventOffset(event, this._domElement);
      const pixelCoords = getNormalizedPixelCoordinates(this._domElement, offset.offsetX, offset.offsetY);
      this.dollyWithWheelScroll(pixelCoords, -deltaDistance);
    } else if (this._camera instanceof OrthographicCamera) {
      const deltaDistance = Math.sign(delta) * this._options.orthographicCameraDollyFactor;
      this.dollyOrthographicCamera(deltaDistance);
    }
  };

  private readonly onTouchStart = (event: PointerEvent) => {
    if (!this.isEnabled) return;
    event.preventDefault();
    this._cameraVector.synchronizeEnd();

    switch (this._pointEventCache.length) {
      case 1: {
        this.startTouchRotation(event);
        break;
      }
      case 2: {
        this.startTouchPinch(event);
        break;
      }
      default:
        break;
    }
  };

  private readonly onFocusChanged = (event: MouseEvent | TouchEvent | FocusEvent) => {
    if (!this.isEnabled) return;
    if (event.type !== 'blur') {
      this._keyboard.disabled = false;
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
    this._domElement.addEventListener('pointerdown', this.onPointerDown);
    this._domElement.addEventListener('wheel', this.onMouseWheel);
    this._domElement.addEventListener('contextmenu', this.onContextMenu);

    // canvas has no blur/focus by default, but it's possible to set tabindex on it,
    // in that case events will be fired (we don't set tabindex here, but still support that case)
    this._domElement.addEventListener('focus', this.onFocusChanged);
    this._domElement.addEventListener('blur', this.onFocusChanged);

    window.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('pointerdown', this.onFocusChanged);
  }

  private removeEventListeners() {
    this._domElement.removeEventListener('pointerdown', this.onPointerDown);
    this._domElement.removeEventListener('wheel', this.onMouseWheel);
    this._domElement.removeEventListener('contextmenu', this.onContextMenu);
    this._domElement.removeEventListener('focus', this.onFocusChanged);
    this._domElement.removeEventListener('blur', this.onFocusChanged);

    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('pointerdown', this.onFocusChanged);
  }

  //================================================
  // INSTANCE METHODS: Rotate
  //================================================

  private startMouseRotation(initialEvent: PointerEvent) {
    let previousOffset = getHTMLOffset(this._domElement, initialEvent.clientX, initialEvent.clientY);

    const onMouseMove = (event: PointerEvent) => {
      const newOffset = getHTMLOffset(this._domElement, event.clientX, event.clientY);
      if (this._keyboard.isCtrlPressed()) {
        this.pan(0, 0, (newOffset.y - previousOffset.y) * this.options.mouseDollySpeed);
      } else {
        const deltaOffset = previousOffset.clone().sub(newOffset);
        this._accumulatedMouseRotation.add(deltaOffset);
      }
      previousOffset = newOffset;
    };

    const onMouseUp = () => {
      window.removeEventListener('pointermove', onMouseMove);
      window.removeEventListener('pointerup', onMouseUp);
    };

    window.addEventListener('pointermove', onMouseMove, { passive: false });
    window.addEventListener('pointerup', onMouseUp, { passive: false });
  }

  private startTouchRotation(initialEvent: PointerEvent) {
    let previousOffset = getHTMLOffset(this._domElement, initialEvent.clientX, initialEvent.clientY);

    const onTouchMove = (event: PointerEvent) => {
      if (!this.isEnabled) return;
      if (this._pointEventCache.length !== 1) {
        return;
      }
      const newOffset = getHTMLOffset(this._domElement, event.clientX, event.clientY);
      previousOffset.sub(newOffset);
      this.rotate(new Vector2().subVectors(previousOffset, newOffset));
      previousOffset = newOffset;
    };

    const onTouchStart = (_event: PointerEvent) => {
      if (!this.isEnabled) return;
      // if num fingers used don't equal 1 then we stop touch rotation
      if (this._pointEventCache.length !== 1) {
        dispose();
      }
    };

    const onTouchEnd = () => {
      dispose();
    };

    const dispose = () => {
      document.removeEventListener('pointerdown', onTouchStart);
      document.removeEventListener('pointermove', onTouchMove);
      document.removeEventListener('pointerup', onTouchEnd);
    };

    document.addEventListener('pointerdown', onTouchStart);
    document.addEventListener('pointermove', onTouchMove, { passive: false });
    document.addEventListener('pointerup', onTouchEnd, { passive: false });
  }

  private rotate(delta: Vector2) {
    if (delta.x === 0 && delta.y === 0) {
      return;
    }
    const deltaAzimuthAngle = this._options.mouseRotationSpeedAzimuth * delta.x;
    const deltaPolarAngle = this._options.mouseRotationSpeedPolar * delta.y;
    this.rotateByAngles(deltaAzimuthAngle, deltaPolarAngle);
  }

  private rotateByAngles(deltaAzimuth: number, deltaPolar: number) {
    if (deltaAzimuth === 0 && deltaPolar === 0) {
      return;
    }
    const cameraVector = this._cameraVector.getVectorEnd();
    if (this.controlsType === ControlsType.FirstPerson) {
      this._translation.end.add(cameraVector);
    }
    const prevCameraVectorEnd = this._cameraVector.end.clone();
    this._cameraVector.end.theta = this.options.getLegalAzimuthAngle(this._cameraVector.end.theta + deltaAzimuth);
    this._cameraVector.end.phi = this.options.getLegalAzimuthAngle(this._cameraVector.end.phi + deltaPolar);
    this._cameraVector.end.makeSafe();

    if (this.controlsType === ControlsType.FirstPerson) {
      this._translation.end.sub(this._cameraVector.getVectorEnd());
    } else if (this.controlsType === ControlsType.Orbit && cameraVector !== null) {
      // Adjust the translation by rotating the entire vector from target to camera position.
      // It is not working perfect, but it is good enough for now.
      const delta = this.newVector3().addVectors(this._translation.end, cameraVector);
      const deltaSpherical = new Spherical().setFromVector3(delta);
      deltaSpherical.theta += this._cameraVector.end.theta - prevCameraVectorEnd.theta;
      deltaSpherical.phi += this._cameraVector.end.phi - prevCameraVectorEnd.phi;

      // Translation = Diff - CameraVector
      const newDelta = this.newVector3().setFromSpherical(deltaSpherical);
      const newTranslation = newDelta.sub(this._cameraVector.getVectorEnd());
      this._translation.end.copy(newTranslation);
    }
  }

  //================================================
  // INSTANCE METHODS: Pinch
  //================================================

  private startTouchPinch(initialEvent: PointerEvent) {
    const index = this._pointEventCache.findIndex(cachedEvent => cachedEvent.pointerId === initialEvent.pointerId);
    this._pointEventCache[index] = initialEvent;
    let previousPinchInfo = getPinchInfo(this._domElement, this._pointEventCache);
    const initialPinchInfo = getPinchInfo(this._domElement, this._pointEventCache);
    const initialRadius = this._cameraVector.end.radius;

    const onTouchMove = (event: PointerEvent) => {
      if (this._pointEventCache.length !== 2) {
        return;
      }
      // Find this event in the cache and update its record with this event
      const index = this._pointEventCache.findIndex(cachedEvent => cachedEvent.pointerId === event.pointerId);
      this._pointEventCache[index] = event;
      const pinchInfo = getPinchInfo(this._domElement, this._pointEventCache);
      // dolly
      const distanceFactor = initialPinchInfo.distance / pinchInfo.distance;
      // Min distance / 5 because on phones it is reasonable to get quite close to the target,
      // but we don't want to get too close since zooming slows down very close to target.
      this._cameraVector.end.radius = Math.max(distanceFactor * initialRadius, this._options.sensitivity / 5);

      // pan
      const deltaCenter = pinchInfo.center.clone().sub(previousPinchInfo.center);
      if (deltaCenter.length() > this._options.pinchEpsilon) {
        deltaCenter.multiplyScalar(this._options.pinchPanSpeed);
        this.pan(deltaCenter.x, deltaCenter.y, 0);
      }
      previousPinchInfo = pinchInfo;
    };

    const onTouchStart = (_event: PointerEvent) => {
      // if num fingers used don't equal 2 then we stop touch pinch
      if (this._pointEventCache.length !== 2) {
        dispose();
      }
    };

    const onTouchEnd = () => {
      dispose();
    };

    const dispose = () => {
      document.removeEventListener('pointerdown', onTouchStart);
      document.removeEventListener('pointermove', onTouchMove);
      document.removeEventListener('pointerup', onTouchEnd);
    };

    document.addEventListener('pointerdown', onTouchStart);
    document.addEventListener('pointermove', onTouchMove);
    document.addEventListener('pointerup', onTouchEnd);
  }

  //================================================
  // INSTANCE METHODS: Pan
  //================================================

  private startMousePan(initialEvent: PointerEvent) {
    let previousOffset = getHTMLOffset(this._domElement, initialEvent.clientX, initialEvent.clientY);

    const onMouseMove = (event: PointerEvent) => {
      const newOffset = getHTMLOffset(this._domElement, event.clientX, event.clientY);
      const deltaX = newOffset.x - previousOffset.x;
      const deltaY = newOffset.y - previousOffset.y;
      if (this._keyboard.isCtrlPressed()) {
        this.pan(0, 0, deltaY * this.options.mouseDollySpeed);
      } else {
        this.pan(deltaX * this.options.mousePanSpeed, deltaY * this.options.mousePanSpeed);
      }
      previousOffset = newOffset;
    };

    const onMouseUp = () => {
      window.removeEventListener('pointermove', onMouseMove);
      window.removeEventListener('pointereup', onMouseUp);
    };

    window.addEventListener('pointermove', onMouseMove, { passive: false });
    window.addEventListener('pointerup', onMouseUp, { passive: false });
  }

  private pan(deltaX: number, deltaY: number, deltaZ: number = 0) {
    // Local function:
    const panByDimension = (distance: number, dimension: number, verical: boolean) => {
      const delta = this.newVector3();
      delta.setFromMatrixColumn(this._camera.matrix, dimension);
      delta.multiplyScalar(-distance);
      if (verical) {
        delta.x = 0;
        delta.z = 0;
      } else {
        delta.y = 0;
      }
      this.translate(delta);
    };
    // Do the actual panning:
    if (deltaX !== 0 || deltaY !== 0) {
      const factor = this.getPanFactor();
      if (deltaX !== 0) panByDimension(+factor * deltaX, 0, false); // Side to side
      if (deltaY !== 0) panByDimension(-factor * deltaY, 1, true); // Up and down
    }
    if (deltaZ !== 0) {
      const factor = this.getPanFactor();
      panByDimension(factor * deltaZ, 2, false); // Forward and backward
    }
  }

  private translate(delta: Vector3) {
    if (delta.manhattanLength() === 0) return;
    if (this.isTargetLocked) {
      this._translation.end.add(delta);
    } else {
      this._target.end.add(delta);
    }
  }

  //================================================
  // INSTANCE METHODS: Dolly
  //================================================

  private dollyOrthographicCamera(deltaDistance: number) {
    const camera = this._camera as OrthographicCamera;
    if (!camera) return;
    camera.zoom *= 1 - deltaDistance;
    camera.zoom = MathUtils.clamp(camera.zoom, this._options.minOrthographicZoom, this._options.maxOrthographicZoom);
    camera.updateProjectionMatrix();
  }

  private dollyWithWheelScroll(pixelCoordinates: Vector2, deltaDistance: number) {
    const translation = this.getRadiusAndTranslation(pixelCoordinates, deltaDistance);
    this.translate(translation);
  }

  private getRadiusAndTranslation(pixelCoordinates: Vector2, deltaDistance: number): Vector3 {
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
    let step = this.options.zoomFraction * this._scrollDistance * Math.sign(deltaDistance);
    if (this.options.realMouseWheelAction === WheelZoomType.PastCursor && Math.abs(step) < Math.abs(deltaDistance)) {
      // If past or near the scroll cursor, go in equal steps
      step = deltaDistance;
    }
    const prevScrollDistance = this._scrollDistance;
    this._scrollDistance -= step;

    if (
      this.options.realMouseWheelAction === WheelZoomType.ToCursor &&
      this._scrollDistance < this.options.sensitivity
    ) {
      // This avoid to close to the scroll cursor
      this._scrollDistance = this.options.sensitivity;
      step = prevScrollDistance - this._scrollDistance;
      //console.log('Close to something');
    }
    //console.log(this._scrollDistance, step, deltaDistance, this.options.sensitivity);
    const translation = this._scrollDirection.clone();
    translation.multiplyScalar(step);
    return translation;
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
    // Nils: Experiments with the timeScale to move smoothly
    const timeScale = true ? 1 : getTimeScale(deltaTimeS);
    if (this.handleRotationFromKeyboard(timeScale)) handled = true;
    if (this.handleMoveFromKeyboard(timeScale)) handled = true;
    return handled;
  }

  private handleRotationFromKeyboard(timeScale: number): boolean {
    let deltaAzimuthAngle =
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
    if (this.controlsType === ControlsType.Orbit) {
      this.setControlsType(ControlsType.FirstPerson);
    }
    const azimuthAngle = this._cameraVector.end.theta;
    deltaAzimuthAngle = this._options.getLegalAzimuthAngle(azimuthAngle + deltaAzimuthAngle) - azimuthAngle;

    // Calculate the azimuth compensation factor. This adjusts the azimuth rotation
    // to make it feel more natural when looking straight up or straight down.
    const deviationFromEquator = Math.abs(this._cameraVector.end.phi - Math.PI / 2);
    const azimuthCompensationFactor = Math.sin(Math.PI / 2 - deviationFromEquator);
    deltaAzimuthAngle *= azimuthCompensationFactor;

    this.rotateByAngles(deltaAzimuthAngle, deltaPolarAngle);
    return true;
  }

  private handleMoveFromKeyboard(timeScale: number): boolean {
    const deltaX = this._keyboard.getKeyboardMovementValue('KeyA', 'KeyD');
    const deltaY = this._keyboard.getKeyboardMovementValue('KeyE', 'KeyQ');
    const deltaZ = this._keyboard.getKeyboardMovementValue('KeyW', 'KeyS');

    if (deltaX === 0 && deltaY === 0 && deltaZ == 0) {
      return false;
    }
    if (this.controlsType === ControlsType.Orbit) {
      this.setControlsType(ControlsType.FirstPerson);
    }
    const speedFactor = this._keyboard.isShiftPressed() ? this._options.keyboardFastMoveFactor : 1;
    const speedXY = timeScale * speedFactor * this._options.keyboardPanSpeed;
    const speedZ = timeScale * speedFactor * this._options.keyboardDollySpeed;

    this.pan(speedXY * deltaX, speedXY * deltaY, speedZ * deltaZ);
    return true;
  }
}

//================================================
// LOCAL FUNCTIONS
//================================================

function isIdentityQuaternion(q: THREE.Quaternion): boolean {
  return q.x === 0 && q.y === 0 && q.z === 0 && q.w === 1;
}

function getHTMLOffset(domElement: HTMLElement, clientX: number, clientY: number): Vector2 {
  return new Vector2(clientX - domElement.offsetLeft, clientY - domElement.offsetTop);
}

function getPinchInfo(domElement: HTMLElement, touches: PointerEvent[]) {
  if (touches.length !== 2) {
    throw new Error('getPinchInfo only works if touches.length === 2');
  }
  const touchList = [touches[0], touches[1]];
  const offsets = touchList.map(({ clientX, clientY }) => getHTMLOffset(domElement, clientX, clientY));
  const center = offsets[0].clone().add(offsets[1]).multiplyScalar(0.5);
  const distance = offsets[0].distanceTo(offsets[1]);
  return {
    center,
    distance,
    offsets
  };
}

function getWheelDelta(event: WheelEvent): number {
  // @ts-ignore event.wheelDelta is only part of WebKit / Opera / Explorer 9
  if (event.wheelDelta) {
    // @ts-ignore event.wheelDelta is only part of WebKit / Opera / Explorer 9
    return -event.wheelDelta / 40;
  }
  if (event.detail) {
    // Firefox
    return event.detail;
  }
  if (event.deltaY) {
    // Firefox / Explorer + event target is SVG.
    const factor = IS_FIREFOX ? 1 : 40;
    return event.deltaY / factor;
  }
  return 0;
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