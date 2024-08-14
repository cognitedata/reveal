/*!
 * Copyright 2021 Cognite AS
 */
// TODO 2021-11-08 larsmoa: Enable explicit-module-boundary-types for ComboControls
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import { getPixelCoordinatesFromEvent, getWheelEventDelta } from '@reveal/utilities';
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
import Keyboard from './Keyboard';
import clamp from 'lodash/clamp';
import { ComboControlsOptions, CreateDefaultControlsOptions } from './ComboControlsOptions';
import { getNormalizedPixelCoordinates } from '@reveal/utilities';

const TARGET_FPS = 30;

/**
 * The event type for events emitted by {@link ComboControls}.
 */
export type ComboControlsEventType = { cameraChange: { camera: { position: Vector3; target: Vector3 } } };

export class ComboControls extends EventDispatcher<ComboControlsEventType> {
  //================================================
  // INSTANCE FIELDS
  //================================================

  public dispose: () => void;

  private _enabled: boolean = true;
  private _options: ComboControlsOptions = CreateDefaultControlsOptions();

  private _temporarilyDisableDamping: boolean = false;
  private readonly _domElement: HTMLElement;
  private readonly _camera: PerspectiveCamera | OrthographicCamera;
  private readonly _reusableCamera: PerspectiveCamera | OrthographicCamera;

  private readonly _target: Vector3 = new Vector3();
  private readonly _targetEnd: Vector3 = new Vector3();
  private readonly _spherical: Spherical = new Spherical();
  private readonly _sphericalEnd: Spherical = new Spherical();
  private readonly _scrollTarget: Vector3 = new Vector3();
  private readonly _viewTarget: Vector3 = new Vector3();

  private readonly _rawCameraRotation = new Quaternion();
  private readonly _accumulatedMouseMove: Vector2 = new Vector2();
  private readonly _keyboard: Keyboard;
  private readonly _pointEventCache: Array<PointerEvent> = [];

  // Temporary objects used for calculations to avoid allocations
  private readonly _reusableVector3s = new ReusableVector3s();
  private readonly _raycaster: Raycaster = new Raycaster();

  //================================================
  // CONSTRUCTOR
  //================================================

  constructor(camera: PerspectiveCamera | OrthographicCamera, domElement: HTMLElement) {
    super();
    this._camera = camera;
    this._reusableCamera = camera.clone() as typeof camera;
    this._domElement = domElement;
    this._keyboard = new Keyboard();

    // rotation
    this._spherical.setFromVector3(camera.position);
    this._sphericalEnd.copy(this._spherical);
    this.addEventListeners();

    this.dispose = () => {
      this.removeEventListeners();
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

  //================================================
  // INSTANCE METHODS: Getters
  //================================================

  public getScrollTarget = (): Vector3 => {
    return this._scrollTarget.clone();
  };

  public getState = () => {
    return {
      target: this._target.clone(),
      position: this._camera.position.clone()
    };
  };

  public setScrollTarget = (target: Vector3) => {
    this._scrollTarget.copy(target);
  };

  public setState = (position: Vector3, target: Vector3) => {
    const offset = position.clone().sub(target);
    this._targetEnd.copy(target);
    this._sphericalEnd.setFromVector3(offset);
    this._target.copy(this._targetEnd);
    this._scrollTarget.copy(target);
    this._spherical.copy(this._sphericalEnd);
    this.update(1000 / TARGET_FPS, true);
    this.triggerCameraChangeEvent();
  };

  public setViewTarget = (target: Vector3) => {
    this._viewTarget.copy(target);
    this.triggerCameraChangeEvent();
  };

  /**
   * Converts deltaTimeS to a time scale based on the target frames per second (FPS).
   *
   * @param deltaTimeS - The elapsed time since the last frame in seconds.
   * @returns The time scale, which is a factor representing the relationship of deltaTimeS to the target FPS.
   */
  private getTimeScale(deltaTimeS: number): number {
    return deltaTimeS * TARGET_FPS;
  }

  private getDollyDeltaDistance(dollyIn: boolean, steps: number = 1) {
    const zoomFactor = this._options.dollyFactor ** steps;
    const factor = dollyIn ? zoomFactor : 1 / zoomFactor;
    const distance = Math.max(
      this._sphericalEnd.radius,
      this._options.panDollyMinDistanceFactor * this._options.minDistance
    );
    return distance * (factor - 1);
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
    // the target framerate
    const actualFPS = Math.min(1 / deltaTimeS, TARGET_FPS);
    const targetFPSOverActualFPS = TARGET_FPS / actualFPS;
    const firstPersonMode = this.handleKeyboard(deltaTimeS);

    if (this._accumulatedMouseMove.lengthSq() > 0) {
      this.rotate(this._accumulatedMouseMove);
      this._accumulatedMouseMove.set(0, 0);
    }

    let deltaTheta = 0;
    if (firstPersonMode) {
      deltaTheta = getShortestDeltaTheta(this._sphericalEnd.theta, this._spherical.theta);
    } else {
      deltaTheta = this._sphericalEnd.theta - this._spherical.theta;
    }
    const deltaPhi = this._sphericalEnd.phi - this._spherical.phi;
    const deltaRadius = this._sphericalEnd.radius - this._spherical.radius;

    const deltaTarget = this.newVector3().subVectors(this._targetEnd, this._target);

    let changed = false;

    const wantDamping = this._options.enableDamping && !this._temporarilyDisableDamping;
    const deltaFactor = wantDamping ? Math.min(this._options.dampingFactor * targetFPSOverActualFPS, 1) : 1;
    this._temporarilyDisableDamping = false;

    const epsilon = this._options.EPSILON;
    if (
      Math.abs(deltaTheta) > epsilon ||
      Math.abs(deltaPhi) > epsilon ||
      Math.abs(deltaRadius) > epsilon ||
      !isVectorAlmostZero(deltaTarget, epsilon)
    ) {
      this._spherical.radius += deltaRadius * deltaFactor;
      this._spherical.phi += deltaPhi * deltaFactor;
      this._spherical.theta += deltaTheta * deltaFactor;
      this._target.add(deltaTarget.multiplyScalar(deltaFactor));
      changed = true;
    } else {
      this._spherical.copy(this._sphericalEnd);
      this._target.copy(this._targetEnd);
    }

    this._spherical.makeSafe();
    this._camera.position.setFromSpherical(this._spherical).add(this._target);

    if (isIdentityQuaternion(this._rawCameraRotation)) {
      this._camera.lookAt(this._options.lookAtViewTarget ? this._viewTarget : this._target);
    } else {
      this._camera.setRotationFromQuaternion(this._rawCameraRotation);
    }
    if (changed) {
      this.triggerCameraChangeEvent();
    }
    // Tell caller if camera has changed
    return changed;
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

    this._sphericalEnd.copy(this._spherical);
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
    this._accumulatedMouseMove.set(0, 0);
  };

  private readonly onMouseWheel = (event: WheelEvent) => {
    if (!this._enabled) {
      return;
    }
    event.preventDefault();

    const delta = getWheelEventDelta(event);
    const position = getPixelCoordinatesFromEvent(event, this._domElement);

    const pixelCoordinates = getNormalizedPixelCoordinates(this._domElement, position.x, position.y);
    const dollyIn = delta < 0;
    let deltaDistance;
    if (this._camera instanceof PerspectiveCamera) {
      deltaDistance = this.getDollyDeltaDistance(dollyIn, Math.abs(delta));
    } else {
      deltaDistance = Math.sign(delta) * this._options.orthographicCameraDollyFactor;
    }
    this.dolly(pixelCoordinates, deltaDistance, false);
  };

  private readonly onTouchStart = (event: PointerEvent) => {
    if (!this._enabled) {
      return;
    }
    event.preventDefault();
    this._sphericalEnd.copy(this._spherical);

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
    if (event.type === 'focus') {
      this._keyboard.clearPressedKeys();
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
    this._keyboard.addEventListeners(this._domElement);
    this._domElement.addEventListener('pointerdown', this.onPointerDown);
    this._domElement.addEventListener('wheel', this.onMouseWheel);
    this._domElement.addEventListener('contextmenu', this.onContextMenu);

    // canvas has focus by default, but it's possible to set tabindex on it,
    // in that case events will be fired (we don't set tabindex here, but still support that case)
    this._domElement.addEventListener('focus', this.onFocusChanged);

    window.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('pointerdown', this.onFocusChanged);
  }

  private removeEventListeners() {
    this._keyboard.removeEventListeners(this._domElement);
    this._domElement.removeEventListener('pointerdown', this.onPointerDown);
    this._domElement.removeEventListener('wheel', this.onMouseWheel);
    this._domElement.removeEventListener('contextmenu', this.onContextMenu);
    this._domElement.removeEventListener('focus', this.onFocusChanged);

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
      this._accumulatedMouseMove.add(deltaOffset);
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
    const azimuthAngle = this._options.pointerRotationSpeedAzimuth * delta.x;
    const polarAngle = this._options.pointerRotationSpeedPolar * delta.y;

    const theta = MathUtils.clamp(
      this._sphericalEnd.theta + azimuthAngle,
      this._options.minAzimuthAngle,
      this._options.maxAzimuthAngle
    );
    const phi = MathUtils.clamp(
      this._sphericalEnd.phi + polarAngle,
      this._options.minPolarAngle,
      this._options.maxPolarAngle
    );
    this._sphericalEnd.theta = theta;
    this._sphericalEnd.phi = phi;
    this._sphericalEnd.makeSafe();
  }

  private rotateFirstPersonMode(deltaAzimuthAngle: number, deltaPolarAngle: number) {
    this._reusableCamera.position.setFromSpherical(this._sphericalEnd).add(this._targetEnd);
    this._reusableCamera.lookAt(this._targetEnd);

    this._reusableCamera.rotateX(this._options.firstPersonRotationFactor * deltaPolarAngle);
    this._reusableCamera.rotateY(this._options.firstPersonRotationFactor * deltaAzimuthAngle);

    const distToTarget = this._targetEnd.distanceTo(this._reusableCamera.position);
    const vector = this._reusableCamera.getWorldDirection(this.newVector3());
    this._targetEnd.addVectors(this._reusableCamera.position, vector.multiplyScalar(distToTarget));
    this._sphericalEnd.setFromVector3(vector.subVectors(this._reusableCamera.position, this._targetEnd));
    this._sphericalEnd.makeSafe();
  }

  //================================================
  // INSTANCE METHODS: Pinch
  //================================================

  private startTouchPinch(initialEvent: PointerEvent) {
    const index = this._pointEventCache.findIndex(cachedEvent => cachedEvent.pointerId === initialEvent.pointerId);
    this._pointEventCache[index] = initialEvent;
    let previousPinchInfo = getPinchInfo(this._domElement, this._pointEventCache);
    const initialPinchInfo = getPinchInfo(this._domElement, this._pointEventCache);
    const initialRadius = this._spherical.radius;

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
      this._sphericalEnd.radius = Math.max(distanceFactor * initialRadius, this._options.minDistance / 5);

      // pan
      const deltaCenter = pinchInfo.center.clone().sub(previousPinchInfo.center);
      if (deltaCenter.length() > this._options.pinchEpsilon) {
        deltaCenter.multiplyScalar(this._options.pinchPanSpeed);
        this.pan(deltaCenter.x, deltaCenter.y);
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
      const xDifference = newOffset.x - previousOffset.x;
      const yDifference = newOffset.y - previousOffset.y;
      previousOffset = newOffset;
      this.pan(xDifference, yDifference);
    };

    const onMouseUp = () => {
      window.removeEventListener('pointermove', onMouseMove);
      window.removeEventListener('pointereup', onMouseUp);
    };

    window.addEventListener('pointermove', onMouseMove, { passive: false });
    window.addEventListener('pointerup', onMouseUp, { passive: false });
  }

  private pan(deltaX: number, deltaY: number) {
    const offsetVector = this.newVector3();
    offsetVector.copy(this._camera.position).sub(this._target);

    let targetDistance = Math.max(
      offsetVector.length(),
      this._options.panDollyMinDistanceFactor * this._options.minDistance
    );

    // half of the fov is center to top of screen
    if (this._camera instanceof PerspectiveCamera) {
      targetDistance *= Math.tan(MathUtils.degToRad(this._camera.fov / 2));
    }

    // we actually don't use screenWidth, since perspective camera is fixed to screen height
    const factor = (2 * targetDistance) / this._domElement.clientHeight;
    this.panLeft(factor * deltaX);
    this.panUp(factor * deltaY);
  }

  private panLeft(distance: number) {
    const panVector = this.newVector3();
    panVector.setFromMatrixColumn(this._camera.matrix, 0); // get X column of objectMatrix
    panVector.multiplyScalar(-distance);
    this._targetEnd.add(panVector);
  }

  private panUp(distance: number) {
    const panVector = this.newVector3();
    panVector.setFromMatrixColumn(this._camera.matrix, 1); // get Y column of objectMatrix
    panVector.multiplyScalar(distance);
    this._targetEnd.add(panVector);
  }

  //================================================
  // INSTANCE METHODS: Dolly
  //================================================

  private dolly(pixelCoordinates: Vector2, deltaDistance: number, moveTarget: boolean) {
    if (this._camera instanceof OrthographicCamera) {
      this.dollyOrthographicCamera(deltaDistance);
    } else if (this._camera instanceof PerspectiveCamera) {
      this.dollyPerspectiveCamera(pixelCoordinates, deltaDistance, moveTarget);
    }
  }

  private dollyOrthographicCamera(deltaDistance: number) {
    const camera = this._camera as OrthographicCamera;
    camera.zoom *= 1 - deltaDistance;
    camera.zoom = MathUtils.clamp(camera.zoom, this._options.minZoom, this._options.maxZoom);
    camera.updateProjectionMatrix();
  }

  private dollyPerspectiveCamera(pixelCoordinates: Vector2, deltaDistance: number, moveOnlyTarget: boolean = false) {
    //@ts-ignore
    this._reusableCamera.copy(this._camera);
    this._reusableCamera.position.setFromSpherical(this._sphericalEnd).add(this._targetEnd);
    this._reusableCamera.lookAt(this._targetEnd);

    const cameraDirection = this.newVector3().setFromSpherical(this._sphericalEnd);

    if (moveOnlyTarget) {
      // move only target together with the camera, radius is constant (for 'w' and 's' keys movement)
      this._reusableCamera.getWorldDirection(cameraDirection);
      this._targetEnd.add(cameraDirection.normalize().multiplyScalar(-deltaDistance));
    } else {
      this.dollyWithWheelScroll(pixelCoordinates, deltaDistance, cameraDirection);
    }
  }

  private dollyWithWheelScroll(pixelCoordinates: Vector2, deltaDistance: number, cameraDirection: Vector3) {
    const isDollyIn = deltaDistance < 0 ? true : false;
    const newTargetOffset = this.newVector3();
    let newRadius = this._sphericalEnd.radius;

    if (this._options.zoomToCursor) {
      if (this._options.useScrollTarget && isDollyIn) {
        const { radius, targetOffset } = this.calculateNewRadiusAndTargetOffsetScrollTarget(
          deltaDistance,
          cameraDirection
        );

        newRadius = radius;
        newTargetOffset.copy(targetOffset);
      } else {
        const { radius, targetOffset } = this.calculateNewRadiusAndTargetOffsetLerp(
          pixelCoordinates,
          deltaDistance,
          cameraDirection
        );

        newRadius = radius;
        newTargetOffset.copy(targetOffset);
      }
    } else {
      const { radius, targetOffset } = this.calculateNewRadiusAndTargetOffsetLerp(
        new Vector2(0, 0),
        deltaDistance,
        cameraDirection
      );

      newRadius = radius;
      newTargetOffset.copy(targetOffset);
    }
    this._targetEnd.add(newTargetOffset);
    this._sphericalEnd.radius = newRadius;
  }

  private calculateNewRadiusAndTargetOffsetLerp(
    pixelCoordinates: Vector2,
    deltaDistance: number,
    cameraDirection: Vector3
  ) {
    const distFromCameraToScreenCenter = Math.tan(MathUtils.degToRad(90 - getFov(this._camera) / 2));
    const distFromCameraToCursor = Math.sqrt(
      distFromCameraToScreenCenter * distFromCameraToScreenCenter + pixelCoordinates.lengthSq()
    );

    const ratio = distFromCameraToCursor / distFromCameraToScreenCenter;
    const distToTarget = cameraDirection.length();
    const isDollyOut = deltaDistance > 0 ? true : false;

    this._raycaster.setFromCamera(pixelCoordinates, this._reusableCamera);

    let radius = distToTarget + deltaDistance;

    if (radius < this._options.minZoomDistance && !isDollyOut) {
      radius = distToTarget;
      if (this._options.dynamicTarget) {
        // push targetEnd forward
        this._reusableCamera.getWorldDirection(cameraDirection);
        this._targetEnd.add(cameraDirection.normalize().multiplyScalar(Math.abs(deltaDistance)));
      } else {
        // stops camera from moving forward
        deltaDistance = 0;
      }
    }

    const distFromRayOrigin = -deltaDistance * ratio;

    this._reusableCamera.getWorldDirection(cameraDirection);
    cameraDirection.normalize().multiplyScalar(deltaDistance);
    const rayDirection = this._raycaster.ray.direction.normalize().multiplyScalar(distFromRayOrigin);
    const targetOffset = rayDirection.add(cameraDirection);

    return { targetOffset, radius };
  }

  private calculateNewRadiusAndTargetOffsetScrollTarget(deltaDistance: number, cameraDirection: Vector3) {
    const isDollyOut = deltaDistance > 0 ? true : false;

    if (isDollyOut) {
      this.setScrollTarget(this._target);
    }
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
    const deltaDownscaleCoefficient = clampedMap(
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

    const distToTarget = cameraDirection.length();
    let radius = distToTarget + deltaDistance;

    // behaviour for scrolling with mouse wheel
    if (radius < this._options.minZoomDistance) {
      this._temporarilyDisableDamping = true;

      const distance = this._scrollTarget.distanceTo(this._target);

      // stops camera from moving forward only if target became close to scroll target
      if (distance < this._options.minZoomDistance) {
        deltaTargetOffsetDistance = 0;
        radius = distToTarget;
      }

      if (radius <= 0) {
        deltaTargetOffsetDistance = 0;

        if (distance > this._options.minZoomDistance) {
          radius = this._options.minZoomDistance;
          this._targetEnd.add(
            cameraDirection.normalize().multiplyScalar(-(this._options.minZoomDistance - distToTarget))
          );
        } else {
          radius = distToTarget;
        }
      }
    }
    // if we scroll out, we don't change the target
    const targetOffset = targetToScrollTargetVec
      .negate()
      .normalize()
      .multiplyScalar(!isDollyOut ? deltaTargetOffsetDistance : 0);

    return { targetOffset, radius };
  }

  //================================================
  // INSTANCE METHODS: Keyboard
  //================================================

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
    const phi = this._sphericalEnd.phi;
    const clampedDeltaPolarAngle =
      clamp(phi + deltaPolarAngle, this._options.minPolarAngle, this._options.maxPolarAngle) - phi;

    // Calculate the azimuth compensation factor. This adjusts the azimuth rotation
    // to make it feel more natural when looking straight up or straight down.
    const deviationFromEquator = Math.abs(phi - Math.PI / 2);
    const azimuthCompensationFactor = Math.sin(Math.PI / 2 - deviationFromEquator);

    const compensatedDeltaAzimuthAngle = deltaAzimuthAngle * azimuthCompensationFactor;

    this.rotateFirstPersonMode(compensatedDeltaAzimuthAngle, clampedDeltaPolarAngle);
    return true;
  }

  private handleDollyFromKeyboard(timeScale: number): boolean {
    const speedFactor = this._keyboard.isShiftPressed() ? this._options.keyboardSpeedFactor : 1;
    const moveDirection = this._keyboard.getKeyboardMovementValue('KeyW', 'KeyS');
    if (moveDirection === 0) {
      return false;
    }
    const booleanMoveDirection = moveDirection === 1;
    const dollyDeltaDistance = this.getDollyDeltaDistance(
      booleanMoveDirection,
      speedFactor * this._options.keyboardDollySpeed * timeScale
    );
    this.dolly(new Vector2(0, 0), dollyDeltaDistance, true);
    return true;
  }

  private handlePanFromKeyboard(timeScale: number): boolean {
    const horizontalMovement = this._keyboard.getKeyboardMovementValue('KeyA', 'KeyD');
    const verticalMovement = this._keyboard.getKeyboardMovementValue('KeyE', 'KeyQ');

    if (horizontalMovement === 0 && verticalMovement === 0) {
      return false;
    }
    const speedFactor = this._keyboard.isShiftPressed() ? this._options.keyboardSpeedFactor : 1;
    const factor = timeScale * speedFactor * this._options.keyboardPanSpeed;
    this.pan(factor * horizontalMovement, factor * verticalMovement);
    return true;
  }

  private handleKeyboard(deltaTimeS: number): boolean {
    if (!this._enabled || !this._options.enableKeyboardNavigation) {
      return false;
    }
    const timeScale = this.getTimeScale(deltaTimeS);
    let handled = false;
    if (this.handleRotationFromKeyboard(timeScale)) handled = true;
    if (this.handleDollyFromKeyboard(timeScale)) handled = true;
    if (this.handlePanFromKeyboard(timeScale)) handled = true;
    return handled;
  }
}

//================================================
// LOCAL FUNCTIONS
//================================================

function isIdentityQuaternion(q: Quaternion) {
  return q.x === 0 && q.y === 0 && q.z === 0 && q.w === 1;
}

function getHTMLOffset(domElement: HTMLElement, clientX: number, clientY: number) {
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

// Function almost equal to mapLinear except it is behaving the same as clamp outside of specified range
function clampedMap(value: number, xStart: number, xEnd: number, yStart: number, yEnd: number) {
  if (value < xStart) value = yStart;
  else if (value > xEnd) value = yEnd;
  else value = MathUtils.mapLinear(value, xStart, xEnd, yStart, yEnd);

  return value;
}

function getShortestDeltaTheta(theta1: number, theta2: number) {
  const twoPi = 2 * Math.PI;
  const rawDeltaTheta = (theta1 % twoPi) - (theta2 % twoPi);

  let deltaTheta = Math.min(Math.abs(rawDeltaTheta), twoPi - Math.abs(rawDeltaTheta));
  const thetaSign = (deltaTheta === Math.abs(rawDeltaTheta) ? 1 : -1) * Math.sign(rawDeltaTheta);
  deltaTheta *= thetaSign;
  return deltaTheta;
}

function getFov(camera: PerspectiveCamera | OrthographicCamera): number {
  if (camera instanceof PerspectiveCamera) {
    return camera.fov;
  }
  return 0;
}

function isVectorAlmostZero(vector: Vector3, epsilon: number): boolean {
  return Math.abs(vector.x) <= epsilon && Math.abs(vector.y) <= epsilon && Math.abs(vector.z) <= epsilon;
}

// Cache for using tempory vectors to avoid allocations
class ReusableVector3s {
  private readonly _vectors = new Array(10).fill(null).map(() => new Vector3());
  private _index: number = -1;

  public getNext(): Vector3 {
    // Increment the index and wrap around if it exceeds the length of the array
    this._index++;
    this._index %= this._vectors.length;
    // Return the vector at the new index
    return this._vectors[this._index];
  }
}
