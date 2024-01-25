/*!
 * Copyright 2021 Cognite AS
 */
// TODO 2021-11-08 larsmoa: Enable explicit-module-boundary-types for ComboControls
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import { clickOrTouchEventOffset } from '@reveal/utilities';
import remove from 'lodash/remove';
import {
  EventDispatcher,
  MathUtils,
  Matrix4,
  MOUSE,
  OrthographicCamera,
  PerspectiveCamera,
  Quaternion,
  Spherical,
  Vector2,
  Vector3
} from 'three';
import Keyboard from './Keyboard';
import { ComboControlsOptions, CreateDefaultControlsOptions } from './ComboControlsOptions';
import { getNormalizedPixelCoordinates } from '@reveal/utilities';
import { ControlsType } from './CameraControlsOptions';

const IS_FIREFOX = navigator.userAgent.toLowerCase().indexOf('firefox') !== -1;
const TARGET_FPS = 30;
const ROTATION_SPEED_FACTOR = 0.1;

/**
 * The event type for events emitted by {@link ComboControls}.
 */
export type ComboControlsEventType = { cameraChange: { camera: { position: Vector3; target: Vector3 } } };

type RadiusAndDeltaTarget = {
  deltaTarget: Vector3;
  radius: number;
};

export class ComboControls extends EventDispatcher<ComboControlsEventType> {
  //================================================
  // INSTANCE FIELDS
  //================================================

  public dispose: () => void;

  private _controlsType: ControlsType = ControlsType.Combo;
  private _enabled: boolean = true;
  private _options: ComboControlsOptions = CreateDefaultControlsOptions();
  private readonly _domElement: HTMLElement;
  private readonly _camera: PerspectiveCamera | OrthographicCamera;
  public temporarlyDisableKeyboard: boolean = false;

  // These are describe below in the ascii-art
  private readonly _target: Vector3 = new Vector3();
  private readonly _targetEnd: Vector3 = new Vector3();
  private readonly _cameraVector: Spherical = new Spherical();
  private readonly _cameraVectorEnd: Spherical = new Spherical();

  // The Translation are used only if NOT the ControlsType.Combo is enabled, it translates the camera
  // and the lookAt without changing the target or cameraVector.
  private readonly _translation: Vector3 = new Vector3();
  private readonly _translationEnd: Vector3 = new Vector3();

  private readonly _scrollTarget: Vector3 = new Vector3(); // When using the wheel this is the maxiumum point to scroll to when mouseWheelAction === 'zoomToCursor'
  private readonly _viewTarget: Vector3 = new Vector3(); // used as target when _options.lookAtViewTarget is true

  private readonly _rawCameraRotation = new Quaternion();
  private readonly _accumulatedMouseRotation: Vector2 = new Vector2();
  private readonly _keyboard: Keyboard;
  private readonly _pointEventCache: Array<PointerEvent> = [];

  // Temporary objects used for calculations to avoid allocations
  private readonly _reusableVector3s = new ReusableVector3s();

  //        ControlsType.Combo
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

  constructor(camera: PerspectiveCamera | OrthographicCamera, domElement: HTMLElement) {
    super();
    this._camera = camera;
    this._domElement = domElement;
    this._keyboard = new Keyboard(this._domElement);
    this._cameraVector.setFromVector3(camera.position);
    this._cameraVectorEnd.copy(this._cameraVector);

    this.addEventListeners();

    this.dispose = () => {
      this.removeEventListeners();
      // Dispose all keyboard events registered. REV-461!
      this._keyboard.dispose();
    };
  }

  //================================================
  // INSTANCE PROPERTIES:
  //================================================

  /**
   * Gets current Combo Controls options.
   */
  get options(): Readonly<ComboControlsOptions> {
    return this._options;
  }

  /**
   * Sets Combo Controls options.
   *
   * Only the provided options will be changed, any undefined options will be kept as is.
   */
  set options(options: Partial<ComboControlsOptions>) {
    this._options = { ...this._options, ...options };
  }

  /**
   * Returns true if these controls are enabled.
   */
  get enabled(): boolean {
    return this._enabled;
  }

  /**
   * Sets the enabled state of these controls.
   */
  set enabled(newEnabledValue: boolean) {
    if (newEnabledValue && !this._enabled) {
      this.addEventListeners();
    } else if (!newEnabledValue && this._enabled) {
      this.removeEventListeners();
    }
    this._enabled = newEnabledValue;
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

  /**
   * Returns the current camera controls type
   */
  public get controlsType(): ControlsType {
    return this._controlsType;
  }

  private get isTargetLocked(): boolean {
    return this.controlsType !== ControlsType.Combo;
  }

  //================================================
  // INSTANCE METHODS: Pulic getters and setters
  //================================================

  /**
   * Returns the scroll target
   */
  public getScrollTarget = (): Vector3 => {
    return this._scrollTarget.clone();
  };

  /**
   * Returns the target
   */
  public getTarget(): Vector3 {
    return this._target.clone();
  }

  /**
   * Returns the position where the camera is looking at
   */
  public getLookAt(): Vector3 {
    if (this._options.lookAtViewTarget) {
      return this._viewTarget;
    }
    if (this.isTargetLocked) {
      return this.newVector3().addVectors(this._target, this._translation);
    }
    return this._target;
  }

  /**
   * Get the camera position and the target
   */
  public getState = () => {
    return {
      target: this.getTarget(),
      position: this._camera.position.clone()
    };
  };

  /**
   * Set the scroll target
   */
  public setScrollTarget = (target: Vector3) => {
    this._scrollTarget.copy(target);
  };

  /**
   * Set the camera position and the target
   */
  public setState = (position: Vector3, target: Vector3) => {
    this._translation.set(0, 0, 0);
    this._translationEnd.set(0, 0, 0);
    this._target.copy(target);
    this._targetEnd.copy(target);
    this._scrollTarget.copy(target);

    // cameraVector = position - target
    const delta = position.clone().sub(target);
    this._cameraVector.setFromVector3(delta);
    this._cameraVectorEnd.copy(this._cameraVector);

    this.update(1000 / TARGET_FPS, true);
    this.triggerCameraChangeEvent();
  };

  /**
   * Set the view target
   */
  public setViewTarget = (target: Vector3) => {
    this._viewTarget.copy(target);
    this.triggerCameraChangeEvent();
  };

  /**
   * Set the current camera controls
   */
  public setControlsType(controlsType: ControlsType): boolean {
    if (controlsType == this._controlsType) {
      return false;
    }
    this._controlsType = controlsType;
    if (this._controlsType === ControlsType.Combo) {
      // This actually change target due to not change the camera position and lookAt
      this._target.add(this._translation);
      this._targetEnd.add(this._translationEnd);
      this._translation.set(0, 0, 0);
      this._translationEnd.set(0, 0, 0);
    }
    return true;
  }

  //================================================
  // INSTANCE METHODS: Private Getters and setters
  //================================================

  private getCameraPosition(): Vector3 {
    const position = this.getCameraVector().add(this._target); // CameraPosition = Target + CameraVector
    if (this.isTargetLocked) {
      position.add(this._translation);
    }
    return position;
  }

  private getCameraVector(): Vector3 {
    return this.newVector3().setFromSpherical(this._cameraVector);
  }

  private getCameraVectorEnd(): Vector3 {
    return this.newVector3().setFromSpherical(this._cameraVectorEnd);
  }

  private getClampedAzimuthAngle(azimuthAngle: number): number {
    return MathUtils.clamp(azimuthAngle, this._options.minAzimuthAngle, this._options.maxAzimuthAngle);
  }

  private getClampedPolarAngle(polarAngle: number): number {
    return MathUtils.clamp(polarAngle, this._options.minPolarAngle, this._options.maxPolarAngle);
  }

  private getDirectionTowards(pixelCoordinates: Vector2, worldPoint: Vector3): Vector3 {
    const position = this.newVector3();
    // unproject the mouse coordinates into 3D space
    position.set(pixelCoordinates.x, pixelCoordinates.y, 0.5).unproject(this._camera);
    return position.sub(worldPoint).normalize().negate();
  }

  private getPanDeltaDistanceForXY() {
    let distance = this._options.panDollyMinDistanceFactor * this._options.minDistance;
    if (this.controlsType === ControlsType.Combo) {
      distance = Math.max(distance, this._cameraVectorEnd.radius);
    }
    // The panning goes parallel to the screen, not perpendicular to the screen.
    // So we get y = x * tan (a), where y is parallel to the screen
    // half of the fov is center to top of screen
    if (this._camera instanceof PerspectiveCamera) {
      distance *= Math.tan(MathUtils.degToRad(this._camera.fov / 2));
    }
    return distance;
  }

  private getDollyDeltaDistanceForZ(dollyIn: boolean, steps: number = 1) {
    let distance = this._options.panDollyMinDistanceFactor * this._options.minDistance;
    if (this.controlsType === ControlsType.Combo) {
      distance = Math.max(distance, this._cameraVectorEnd.radius);
    }
    const zoomFactor = this._options.dollyFactor ** steps;
    const factor = dollyIn ? zoomFactor : 1 / zoomFactor;
    return distance * (factor - 1);
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

  public update = (deltaTimeS: number, forceUpdate = false): boolean => {
    if (!forceUpdate && !this._enabled) {
      return false;
    }
    if (this._accumulatedMouseRotation.lengthSq() > 2) {
      this.rotate(this._accumulatedMouseRotation);
      this._accumulatedMouseRotation.set(0, 0);
    }
    this.handleKeyboard(deltaTimeS);

    const deltaCameraVector = substractSpherical(this._cameraVectorEnd, this._cameraVector);
    const deltaTarget = this.newVector3().subVectors(this._targetEnd, this._target);
    const epsilon = this._options.EPSILON;
    let isChanged = !isVectorAlmostZero(deltaTarget, epsilon) || !isSphericalAlmostZero(deltaCameraVector, epsilon);

    let deltaTranslation: Vector3 | null = null;
    if (this.isTargetLocked) {
      deltaTranslation = this.newVector3().subVectors(this._translationEnd, this._translation);
      if (!isChanged) {
        isChanged = !isVectorAlmostZero(deltaTranslation, epsilon);
      }
    }
    if (isChanged) {
      const dampningFactor = this.getDampingFactor(deltaTimeS);
      addScaledSpherical(this._cameraVector, deltaCameraVector, dampningFactor);
      this._target.addScaledVector(deltaTarget, dampningFactor);
      if (deltaTranslation !== null) {
        this._translation.addScaledVector(deltaTranslation, dampningFactor);
      }
    } else {
      this._cameraVector.copy(this._cameraVectorEnd);
      this._target.copy(this._targetEnd);
      if (deltaTranslation !== null) {
        this._translation.copy(this._translationEnd);
      }
    }
    this._cameraVector.makeSafe();
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
  };

  public triggerCameraChangeEvent = () => {
    this.dispatchEvent({
      type: 'cameraChange',
      camera: {
        position: this._camera.position,
        target: this._target
      }
    });
  };

  //================================================
  // INSTANCE METHODS: Event
  //================================================

  private readonly onPointerDown = (event: PointerEvent) => {
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
    if (!this._enabled) {
      return;
    }
    this._cameraVectorEnd.copy(this._cameraVector);
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
    this._accumulatedMouseRotation.set(0, 0);
  };

  private readonly onMouseWheel = (event: WheelEvent) => {
    if (!this._enabled) {
      return;
    }
    event.preventDefault();

    const delta = getWheelDelta(event);
    const domElementRelativeOffset = clickOrTouchEventOffset(event, this._domElement);

    const pixelCoordinates = getNormalizedPixelCoordinates(
      this._domElement,
      domElementRelativeOffset.offsetX,
      domElementRelativeOffset.offsetY
    );
    const dollyIn = delta < 0;
    if (this._camera instanceof PerspectiveCamera) {
      const deltaDistance = this.getDollyDeltaDistanceForZ(dollyIn, Math.abs(delta));
      this.dollyWithWheelScroll(pixelCoordinates, deltaDistance);
    } else if (this._camera instanceof OrthographicCamera) {
      const deltaDistance = Math.sign(delta) * this._options.orthographicCameraDollyFactor;
      this.dollyOrthographicCamera(deltaDistance);
    }
  };

  private readonly onTouchStart = (event: PointerEvent) => {
    if (!this._enabled) {
      return;
    }
    event.preventDefault();
    this._cameraVectorEnd.copy(this._cameraVector);

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
    if (event.type !== 'blur') {
      this._keyboard.disabled = false;
    }
  };

  private readonly onContextMenu = (event: MouseEvent) => {
    if (!this._enabled) {
      return;
    }
    event.preventDefault();
  };

  //================================================
  // INSTANCE METHODS: Operations
  //================================================

  private addEventListeners() {
    this._domElement.addEventListener('pointerdown', this.onPointerDown);
    this._domElement.addEventListener('wheel', event => this.onMouseWheel(event));
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
      const deltaOffset = previousOffset.clone().sub(newOffset);
      this._accumulatedMouseRotation.add(deltaOffset);
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
      if (this._pointEventCache.length !== 1) {
        return;
      }
      const newOffset = getHTMLOffset(this._domElement, event.clientX, event.clientY);
      previousOffset.sub(newOffset);
      this.rotate(new Vector2().subVectors(previousOffset, newOffset));
      previousOffset = newOffset;
    };

    const onTouchStart = (_event: PointerEvent) => {
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
    const deltaAzimuthAngle = ROTATION_SPEED_FACTOR * this._options.pointerRotationSpeedAzimuth * delta.x;
    const deltaPolarAngle = ROTATION_SPEED_FACTOR * this._options.pointerRotationSpeedPolar * delta.y;
    this.rotateByAngles(deltaAzimuthAngle, deltaPolarAngle);
  }

  private rotateByAngles(deltaAzimuthAngle: number, deltaPolarAngle: number) {
    if (deltaAzimuthAngle === 0 && deltaPolarAngle === 0) {
      return;
    }
    let cameraVector: Vector3 | null = null;
    if (this.controlsType === ControlsType.FirstPerson) {
      this._translationEnd.add(this.getCameraVectorEnd());
    } else if (this.controlsType === ControlsType.Orbit) {
      cameraVector = this.getCameraVectorEnd();
    }
    this._cameraVectorEnd.theta = this.getClampedAzimuthAngle(this._cameraVectorEnd.theta + deltaAzimuthAngle);
    this._cameraVectorEnd.phi = this.getClampedPolarAngle(this._cameraVectorEnd.phi + deltaPolarAngle);
    this._cameraVectorEnd.makeSafe();

    if (this.controlsType === ControlsType.FirstPerson) {
      this._translationEnd.sub(this.getCameraVectorEnd());
    } else if (this.controlsType === ControlsType.Orbit && cameraVector !== null) {
      // rotate the _translationEnd the same way as the _cameraVectorEnd.
      // This is not working perfectly, but it is good enough for now.
      // I have tried other ways, but all turn out to have the same result.
      // The error is proporsional to the distance beetween the target and the lookat point and when both theta and phi is changed
      // It is something with the math which is not correct, but the code itself is good.
      const cameraVectorEnd = this.getCameraVectorEnd();
      const axis = this.newVector3().crossVectors(cameraVector, cameraVectorEnd);
      axis.normalize();
      const angle = cameraVector.angleTo(cameraVectorEnd);
      const matrix = new Matrix4().makeRotationAxis(axis, angle);
      this._translationEnd.applyMatrix4(matrix);
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
    const initialRadius = this._cameraVector.radius;

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
      this._cameraVectorEnd.radius = Math.max(distanceFactor * initialRadius, this._options.minDistance / 5);

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
      previousOffset = newOffset;
      this.pan(deltaX, deltaY, 0);
    };

    const onMouseUp = () => {
      window.removeEventListener('pointermove', onMouseMove);
      window.removeEventListener('pointereup', onMouseUp);
    };

    window.addEventListener('pointermove', onMouseMove, { passive: false });
    window.addEventListener('pointerup', onMouseUp, { passive: false });
  }

  private pan(deltaX: number, deltaY: number, deltaZ: number, speedZ: number = 1) {
    // Local function:
    const panByDimension = (distance: number, dimension: number) => {
      const delta = this.newVector3();
      delta.setFromMatrixColumn(this._camera.matrix, dimension);
      delta.multiplyScalar(-distance);
      this.translate(delta);
    };
    // Do the actuall panning:
    if (deltaX !== 0 || deltaY !== 0) {
      const deltaDistance = this.getPanDeltaDistanceForXY();
      // we actually don't use screenWidth, since perspective camera is fixed to screen height
      const factor = (2 * deltaDistance) / this._domElement.clientHeight;
      if (deltaX !== 0) panByDimension(+factor * deltaX, 0);
      if (deltaY !== 0) panByDimension(-factor * deltaY, 1);
    }
    if (deltaZ !== 0) {
      const deltaDistance = this.getDollyDeltaDistanceForZ(deltaZ === 1, speedZ);
      panByDimension(-deltaDistance, 2); // +factor * deltaZ
    }
  }

  private translate(delta: Vector3) {
    if (delta.lengthSq() === 0) return;
    if (this.isTargetLocked) {
      this._translationEnd.add(delta);
    } else {
      this._targetEnd.add(delta);
    }
  }

  //================================================
  // INSTANCE METHODS: Dolly
  //================================================

  private dollyOrthographicCamera(deltaDistance: number) {
    const camera = this._camera as OrthographicCamera;
    if (!camera) return;
    camera.zoom *= 1 - deltaDistance;
    camera.zoom = MathUtils.clamp(camera.zoom, this._options.minZoom, this._options.maxZoom);
    camera.updateProjectionMatrix();
  }

  private dollyWithWheelScroll(pixelCoordinates: Vector2, deltaDistance: number) {
    const result = this.getRadiusAndDeltaTarget(pixelCoordinates, deltaDistance);
    this._cameraVectorEnd.radius = result.radius;
    this.translate(result.deltaTarget);
  }

  private getRadiusAndDeltaTarget(pixelCoordinates: Vector2, deltaDistance: number): RadiusAndDeltaTarget {
    if (this._options.zoomToCursor) {
      if (this._options.useScrollTarget) {
        return this.getRadiusAndDeltaTargetUsingScrollTarget(deltaDistance);
      } else {
        return this.getRadiusAndDeltaTargetUsingCursor(pixelCoordinates, deltaDistance);
      }
    } else {
      return this.getRadiusAndDeltaTargetUsingCursor(new Vector2(0, 0), deltaDistance);
    }
  }

  private getRadiusAndDeltaTargetUsingCursor(pixelCoordinates: Vector2, deltaDistance: number): RadiusAndDeltaTarget {
    const cameraVector = this.getCameraVectorEnd();
    const distanceToTarget = cameraVector.length();
    const isDollyOut = deltaDistance > 0 ? true : false;
    cameraVector.normalize().negate();

    let radius = distanceToTarget + deltaDistance;
    if (radius < this._options.minZoomDistance && !isDollyOut) {
      radius = distanceToTarget;
      if (this._options.dynamicTarget && !this.isTargetLocked) {
        // push targetEnd forward
        this._targetEnd.addScaledVector(cameraVector, Math.abs(deltaDistance));
      } else {
        // stops camera from moving forward
        return { deltaTarget: new Vector3(0, 0, 0), radius };
      }
    }
    const distFromCameraToScreenCenter = Math.tan(MathUtils.degToRad(90 - getFov(this._camera) / 2));
    const distFromCameraToCursor = Math.sqrt(
      distFromCameraToScreenCenter * distFromCameraToScreenCenter + pixelCoordinates.lengthSq()
    );
    const ratio = distFromCameraToCursor / distFromCameraToScreenCenter;
    const distanceFromRayOrigin = -deltaDistance * ratio;
    cameraVector.multiplyScalar(deltaDistance);

    const directionToTargetEnd = this.getDirectionTowards(pixelCoordinates, this._camera.position);
    const deltaTarget = cameraVector.addScaledVector(directionToTargetEnd, distanceFromRayOrigin);
    return { deltaTarget, radius };
  }

  private getRadiusAndDeltaTargetUsingScrollTarget(deltaDistance: number): RadiusAndDeltaTarget {
    // Here we use the law of sines to determine how far we want to move the target.
    // Direction is always determined by scrollTarget-target vector
    const targetToScrollTargetVec = this.newVector3().subVectors(this._scrollTarget, this._target);
    const cameraToTargetVec = this.newVector3().subVectors(this._target, this._camera.position);
    const cameraToScrollTargetVec = this.newVector3().subVectors(this._scrollTarget, this._camera.position);

    const targetCameraScrollTargetAngle = cameraToTargetVec.angleTo(cameraToScrollTargetVec);
    const targetScrollTargetCameraAngle = targetToScrollTargetVec
      .clone()
      .negate()
      .angleTo(cameraToScrollTargetVec.clone().negate());

    let deltaTargetOffsetDistance =
      deltaDistance * (Math.sin(targetCameraScrollTargetAngle) / Math.sin(targetScrollTargetCameraAngle));

    const targetOffsetToDeltaRatio = Math.abs(deltaTargetOffsetDistance / deltaDistance);

    // if target movement is too fast we want to slow it down a bit
    const deltaDownscaleCoefficient = clampedMapLinear(
      targetOffsetToDeltaRatio,
      this._options.minDeltaRatio,
      this._options.maxDeltaRatio,
      this._options.maxDeltaDownscaleCoefficient,
      this._options.minDeltaDownscaleCoefficient
    );

    if (
      Math.abs(deltaDistance) > this._options.minDistance ||
      Math.abs(deltaTargetOffsetDistance) > this._options.minDistance
    ) {
      deltaDistance *= deltaDownscaleCoefficient;
      deltaTargetOffsetDistance *= deltaDownscaleCoefficient;
    }
    const cameraVector = this.getCameraVectorEnd();
    const distanceToTarget = cameraVector.length();
    let radius = distanceToTarget + deltaDistance;

    if (radius < this._options.minZoomDistance) {
      const distance = this._scrollTarget.distanceTo(this._target);

      // stops camera from moving forward only if target became close to scroll target
      if (distance < this._options.minZoomDistance) {
        radius = distanceToTarget;
        return { deltaTarget: new Vector3(0, 0, 0), radius };
      }

      if (radius <= 0) {
        if (distance > this._options.minZoomDistance && !this.isTargetLocked) {
          radius = this._options.minZoomDistance;
          this._targetEnd.addScaledVector(cameraVector.normalize(), distanceToTarget - this._options.minZoomDistance);
        } else {
          radius = distanceToTarget;
        }
        return { deltaTarget: new Vector3(0, 0, 0), radius };
      }
    }
    // if we scroll out, we don't change the target
    const deltaTarget = targetToScrollTargetVec.negate().normalize().multiplyScalar(deltaTargetOffsetDistance);
    return { deltaTarget, radius };
  }

  //================================================
  // INSTANCE METHODS: Keyboard
  //================================================

  private handleKeyboard(deltaTimeS: number): boolean {
    if (!this._enabled) {
      return false;
    }
    let handled = this.handleModeFromKeyboard();
    if (!this._options.enableKeyboardNavigation) {
      return handled;
    }
    if (this.temporarlyDisableKeyboard) {
      return handled;
    }
    const timeScale = getTimeScale(deltaTimeS);
    if (this.handleRotationFromKeyboard(timeScale)) handled = true;
    if (this.handleMoveFromKeyboard(timeScale)) handled = true;
    return handled;
  }

  private handleModeFromKeyboard(): boolean {
    if (this._keyboard.isPressed('Digit1')) {
      return this.setControlsType(ControlsType.FirstPerson);
    }
    if (this._keyboard.isPressed('Digit2')) {
      return this.setControlsType(ControlsType.Orbit);
    }
    if (this._keyboard.isPressed('Digit3')) {
      return this.setControlsType(ControlsType.Combo);
    }
    return false;
  }

  private handleRotationFromKeyboard(timeScale: number): boolean {
    let deltaAzimuthAngle =
      this._options.keyboardRotationSpeedAzimuth *
      this._keyboard.getKeyboardMovementValue('ArrowLeft', 'ArrowRight') *
      timeScale;

    let deltaPolarAngle =
      this._options.keyboardRotationSpeedPolar *
      this._keyboard.getKeyboardMovementValue('ArrowUp', 'ArrowDown') *
      timeScale;

    if (deltaAzimuthAngle === 0 && deltaPolarAngle === 0) {
      return false;
    }
    if (this.controlsType === ControlsType.Orbit) {
      this.setControlsType(ControlsType.FirstPerson);
    }

    deltaAzimuthAngle *= ROTATION_SPEED_FACTOR;
    deltaPolarAngle *= ROTATION_SPEED_FACTOR;

    const polarAngle = this._cameraVectorEnd.phi;
    const azimuthAngle = this._cameraVectorEnd.theta;
    deltaAzimuthAngle = this.getClampedAzimuthAngle(azimuthAngle + deltaAzimuthAngle) - azimuthAngle;

    // Calculate the azimuth compensation factor. This adjusts the azimuth rotation
    // to make it feel more natural when looking straight up or straight down.
    const deviationFromEquator = Math.abs(polarAngle - Math.PI / 2);
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
    const speedFactor = this._keyboard.isShiftPressed() ? this._options.keyboardSpeedFactor : 1;
    const speedXY = timeScale * speedFactor * this._options.keyboardPanSpeed;
    const speedZ = timeScale * speedFactor * this._options.keyboardDollySpeed;

    this.pan(speedXY * deltaX, speedXY * deltaY, deltaZ, speedZ);
    return true;
  }
}

//================================================
// LOCAL FUNCTIONS
//================================================

function isIdentityQuaternion(q: THREE.Quaternion): boolean {
  return q.x === 0 && q.y === 0 && q.z === 0 && q.w === 1;
}

function isVectorAlmostZero(value: Vector3, epsilon: number): boolean {
  return Math.abs(value.x) <= epsilon && Math.abs(value.y) <= epsilon && Math.abs(value.z) <= epsilon;
}

function isSphericalAlmostZero(value: Spherical, epsilon: number): boolean {
  return Math.abs(value.radius) <= epsilon && Math.abs(value.phi) <= epsilon && Math.abs(value.theta) <= epsilon;
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

function getFov(camera: PerspectiveCamera | OrthographicCamera): number {
  if (camera instanceof PerspectiveCamera) {
    return camera.fov;
  }
  return 0;
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

// Function almost equal to mapLinear except it is behaving the same as clamp outside of specified range
function clampedMapLinear(value: number, xStart: number, xEnd: number, yStart: number, yEnd: number): number {
  if (value < xStart) value = yStart;
  else if (value > xEnd) value = yEnd;
  else value = MathUtils.mapLinear(value, xStart, xEnd, yStart, yEnd);
  return value;
}

function addScaledSpherical(a: Spherical, b: Spherical, factor: number) {
  // This replace:
  // a.radius += b.radius * factor;
  // a.phi += b.phi * factor;
  // a.theta += b.theta * factor;

  // This calculation a = a + b * factor
  const aa = new Vector3().setFromSpherical(a);
  const bb = new Vector3().setFromSpherical(b);
  aa.addScaledVector(bb, factor);
  a.setFromVector3(aa);
  a.makeSafe();
}

function substractSpherical(a: Spherical, b: Spherical): Spherical {
  //  This replace: new Spherical(a.radius - b.radius, a.phi - b.phi, a.theta - b.theta);
  const aa = new Vector3().setFromSpherical(a);
  const bb = new Vector3().setFromSpherical(b);
  aa.sub(bb);
  const result = new Spherical().setFromVector3(aa);
  result.makeSafe();
  return result;
}

// function getShortestDeltaTheta(theta1: number, theta2: number): number {
//   const twoPi = 2 * Math.PI;
//   const rawDeltaTheta = (theta1 % twoPi) - (theta2 % twoPi);

//   let deltaTheta = Math.min(Math.abs(rawDeltaTheta), twoPi - Math.abs(rawDeltaTheta));
//   const thetaSign = (deltaTheta === Math.abs(rawDeltaTheta) ? 1 : -1) * Math.sign(rawDeltaTheta);
//   deltaTheta *= thetaSign;
//   return deltaTheta;
// }

// Cache for using temporarily vectors to avoid allocations
class ReusableVector3s {
  private readonly _vectors = new Array(30).fill(null).map(() => new Vector3());
  private _index: number = -1;

  public getNext(): Vector3 {
    // Increment the index and wrap around if it exceeds the length of the array
    this._index++;
    this._index %= this._vectors.length;
    // Return the vector at the new index
    return this._vectors[this._index];
  }
}
