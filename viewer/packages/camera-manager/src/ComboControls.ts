/*!
 * Copyright 2021 Cognite AS
 */

import {
  EventDispatcher,
  MOUSE,
  Spherical,
  Vector2,
  Vector3,
  Raycaster,
  PerspectiveCamera,
  OrthographicCamera,
  MathUtils
} from 'three';
import Keyboard from './Keyboard';

const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') !== -1;

function getHTMLOffset(domElement: HTMLElement, clientX: number, clientY: number) {
  return new Vector2(clientX - domElement.offsetLeft, clientY - domElement.offsetTop);
}

function getPinchInfo(domElement: HTMLElement, touches: TouchList) {
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

const defaultPointerRotationSpeed = Math.PI / 360; // half degree per pixel
const defaultKeyboardRotationSpeed = defaultPointerRotationSpeed * 10;

export default class ComboControls extends EventDispatcher {
  public enabled: boolean = true;
  public enableDamping: boolean = true;
  public dampingFactor: number = 0.4;
  public dynamicTarget: boolean = true;
  public minDistance: number = 0.1;
  public maxDistance: number = Infinity;
  public dollyFactor: number = 0.98;
  public minPolarAngle: number = 0; // radians
  public maxPolarAngle: number = Math.PI; // radians
  public minAzimuthAngle: number = -Infinity; // radians
  public maxAzimuthAngle: number = Infinity; // radians
  public panDollyMinDistanceFactor: number = 10.0;
  public firstPersonRotationFactor: number = 0.4;
  public pointerRotationSpeedAzimuth: number = defaultPointerRotationSpeed; // radians per pixel
  public pointerRotationSpeedPolar: number = defaultPointerRotationSpeed; // radians per pixel
  public enableKeyboardNavigation: boolean = true;
  public keyboardRotationSpeedAzimuth: number = defaultKeyboardRotationSpeed;
  public keyboardRotationSpeedPolar: number = defaultKeyboardRotationSpeed;
  public mouseFirstPersonRotationSpeed: number = defaultPointerRotationSpeed * 2;
  public keyboardDollySpeed: number = 2;
  public keyboardPanSpeed: number = 10;
  public keyboardSpeedFactor: number = 3; // how much quicker keyboard navigation will be with 'shift' pressed
  public pinchEpsilon: number = 2;
  public pinchPanSpeed: number = 1;
  public EPSILON: number = 0.001;
  public dispose: () => void;
  public minZoom: number = 0;
  public maxZoom: number = Infinity;
  public orthographicCameraDollyFactor: number = 0.3;
  public lookAtViewTarget = false;
  public useScrollTarget = false;

  private _temporarilyDisableDamping: boolean = false;
  private _camera: PerspectiveCamera | OrthographicCamera;
  private _firstPersonMode: boolean = false;
  private _reusableCamera: PerspectiveCamera | OrthographicCamera;
  private _reusableVector3: Vector3 = new Vector3();
  private _accumulatedMouseMove: Vector2 = new Vector2();
  private _domElement: HTMLElement;
  private _target: Vector3 = new Vector3();
  private _viewTarget: Vector3 = new Vector3();
  private _scrollTarget: Vector3 = new Vector3();
  private _targetEnd: Vector3 = new Vector3();
  private _spherical: Spherical = new Spherical();
  private _sphericalEnd: Spherical = new Spherical();
  private _deltaTarget: Vector3 = new Vector3();
  private _keyboard: Keyboard = new Keyboard();

  private _offsetVector: Vector3 = new Vector3();
  private _panVector: Vector3 = new Vector3();
  private _raycaster: Raycaster = new Raycaster();
  private _targetFPS: number = 30;
  private _targetFPSOverActualFPS: number = 1;
  private _isFocused = false;

  constructor(camera: PerspectiveCamera | OrthographicCamera, domElement: HTMLElement) {
    super();
    this._camera = camera;
    this._reusableCamera = camera.clone() as typeof camera;
    this._domElement = domElement;

    // rotation

    this._spherical.setFromVector3(camera.position);
    this._sphericalEnd.copy(this._spherical);

    domElement.addEventListener('mousedown', this.onMouseDown);
    domElement.addEventListener('touchstart', this.onTouchStart);
    domElement.addEventListener('wheel', this.onMouseWheel);
    domElement.addEventListener('contextmenu', this.onContextMenu);

    // canvas has no blur/focus by default, but it's possible to set tabindex on it,
    // in that case events will be fired (we don't set tabindex here, but still support that case)
    domElement.addEventListener('focus', this.onFocusChanged);
    domElement.addEventListener('blur', this.onFocusChanged);

    window.addEventListener('mouseup', this.onMouseUp);
    window.addEventListener('mousedown', this.onFocusChanged);
    window.addEventListener('touchstart', this.onFocusChanged);

    this.dispose = () => {
      domElement.removeEventListener('mousedown', this.onMouseDown);
      domElement.removeEventListener('wheel', this.onMouseWheel);
      domElement.removeEventListener('touchstart', this.onTouchStart);
      domElement.removeEventListener('contextmenu', this.onContextMenu);
      domElement.removeEventListener('focus', this.onFocusChanged);
      domElement.removeEventListener('blur', this.onFocusChanged);

      window.removeEventListener('mouseup', this.onMouseUp);
      window.removeEventListener('mousedown', this.onFocusChanged);
      window.removeEventListener('touchstart', this.onFocusChanged);
    };
  }

  public update = (deltaTime: number): boolean => {
    const {
      _camera,
      _target,
      _targetEnd,
      _spherical,
      _sphericalEnd,
      _deltaTarget,
      handleKeyboard,
      enableDamping,
      dampingFactor,
      EPSILON,
      _targetFPS,
      enabled
    } = this;

    if (!enabled) {
      return false;
    }

    // the target framerate
    const actualFPS = Math.min(1 / deltaTime, _targetFPS);
    this._targetFPSOverActualFPS = _targetFPS / actualFPS;

    handleKeyboard();

    if (this._accumulatedMouseMove.lengthSq() > 0) {
      this.rotate(this._accumulatedMouseMove.x, this._accumulatedMouseMove.y);
      this._accumulatedMouseMove.set(0, 0);
    }

    _sphericalEnd.theta = Math.sign(_sphericalEnd.theta) * Math.min(Math.abs(_sphericalEnd.theta), 2.0 * Math.PI);

    let deltaTheta = _sphericalEnd.theta - _spherical.theta;

    if (Math.abs(deltaTheta) > Math.PI) {
      deltaTheta -= 2.0 * Math.PI * Math.sign(deltaTheta);
    }
    const deltaPhi = _sphericalEnd.phi - _spherical.phi;
    const deltaRadius = _sphericalEnd.radius - _spherical.radius;
    _deltaTarget.subVectors(_targetEnd, _target);

    let changed = false;

    const wantDamping = enableDamping && !this._temporarilyDisableDamping;
    const deltaFactor = wantDamping ? Math.min(dampingFactor * this._targetFPSOverActualFPS, 1) : 1;
    this._temporarilyDisableDamping = false;

    if (
      Math.abs(deltaTheta) > EPSILON ||
      Math.abs(deltaPhi) > EPSILON ||
      Math.abs(deltaRadius) > EPSILON ||
      Math.abs(_deltaTarget.x) > EPSILON ||
      Math.abs(_deltaTarget.y) > EPSILON ||
      Math.abs(_deltaTarget.z) > EPSILON
    ) {
      _spherical.set(
        _spherical.radius + deltaRadius * deltaFactor,
        _spherical.phi + deltaPhi * deltaFactor,
        _spherical.theta + deltaTheta * deltaFactor
      );
      _spherical.theta = _spherical.theta % (2.0 * Math.PI);
      _target.add(_deltaTarget.multiplyScalar(deltaFactor));
      changed = true;
    } else {
      _spherical.copy(_sphericalEnd);
      _target.copy(_targetEnd);
    }

    _spherical.makeSafe();
    _camera.position.setFromSpherical(_spherical).add(_target);
    _camera.lookAt(this.lookAtViewTarget ? this._viewTarget : _target);

    if (changed) {
      this.triggerCameraChangeEvent();
    }

    // Tell caller if camera has changed
    return changed;
  };

  public getState = () => {
    const { _target, _camera } = this;
    return {
      target: _target.clone(),
      position: _camera.position.clone()
    };
  };

  public setState = (position: Vector3, target: Vector3) => {
    const offset = position.clone().sub(target);
    this._targetEnd.copy(target);
    this._sphericalEnd.setFromVector3(offset);
    this._target.copy(this._targetEnd);
    this._scrollTarget.copy(target);
    this._spherical.copy(this._sphericalEnd);
    this.update(1000 / this._targetFPS);
    this.triggerCameraChangeEvent();
  };

  public setViewTarget = (target: Vector3) => {
    this._viewTarget.copy(target);
  };

  public setScrollTarget = (target: Vector3) => {
    this._scrollTarget.copy(target);
  };

  public triggerCameraChangeEvent = () => {
    const { _camera, _target } = this;
    this.dispatchEvent({
      type: 'cameraChange',
      camera: {
        position: _camera.position,
        target: _target
      }
    });
  };

  private onMouseDown = (event: MouseEvent) => {
    if (!this.enabled) {
      return;
    }

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

  private onMouseUp = (_event: MouseEvent) => {
    this._accumulatedMouseMove.set(0, 0);
  };

  private onMouseWheel = (event: WheelEvent) => {
    if (!this.enabled) {
      return;
    }
    event.preventDefault();

    let delta = 0;
    // @ts-ignore event.wheelDelta is only part of WebKit / Opera / Explorer 9
    if (event.wheelDelta) {
      // @ts-ignore event.wheelDelta is only part of WebKit / Opera / Explorer 9
      delta = -event.wheelDelta / 40;
    } else if (event.detail) {
      // Firefox
      delta = event.detail;
    } else if (event.deltaY) {
      // Firefox / Explorer + event target is SVG.
      const factor = isFirefox ? 1 : 40;
      delta = event.deltaY / factor;
    }

    const { _domElement } = this;
    let x = event.offsetX;
    let y = event.offsetY;
    x = (x / _domElement.clientWidth) * 2 - 1;
    y = (y / _domElement.clientHeight) * -2 + 1;

    const dollyIn = delta < 0;
    const deltaDistance =
      // @ts-ignore
      this._camera.isPerspectiveCamera
        ? this.getDollyDeltaDistance(dollyIn, Math.abs(delta))
        : Math.sign(delta) * this.orthographicCameraDollyFactor;
    this.dolly(x, y, deltaDistance, false);
  };

  private onTouchStart = (event: TouchEvent) => {
    if (!this.enabled) {
      return;
    }
    event.preventDefault();

    switch (event.touches.length) {
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

  private onFocusChanged = (event: MouseEvent | TouchEvent | FocusEvent) => {
    this._isFocused =
      event.type !== 'blur' && (event.target === this._domElement || document.activeElement === this._domElement);

    this._keyboard.disabled = !this._isFocused;
  };

  private onContextMenu = (event: MouseEvent) => {
    if (!this.enabled) {
      return;
    }
    event.preventDefault();
  };

  private rotate = (deltaX: number, deltaY: number) => {
    if (deltaX === 0 && deltaY === 0) {
      return;
    }

    const azimuthAngle =
      (this._firstPersonMode ? this.mouseFirstPersonRotationSpeed : this.pointerRotationSpeedAzimuth) * deltaX;
    const polarAngle =
      (this._firstPersonMode ? this.mouseFirstPersonRotationSpeed : this.pointerRotationSpeedPolar) * deltaY;

    if (this._firstPersonMode) {
      this._temporarilyDisableDamping = true;
      this.rotateFirstPersonMode(azimuthAngle, polarAngle);
    } else {
      this.rotateSpherical(azimuthAngle, polarAngle);
    }
  };

  private startMouseRotation = (initialEvent: MouseEvent) => {
    let previousOffset = getHTMLOffset(this._domElement, initialEvent.clientX, initialEvent.clientY);
    const onMouseMove = (event: MouseEvent) => {
      const newOffset = getHTMLOffset(this._domElement, event.clientX, event.clientY);
      const deltaOffset = previousOffset.clone().sub(newOffset);
      this._accumulatedMouseMove.add(deltaOffset);
      previousOffset = newOffset;
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: false });
    window.addEventListener('mouseup', onMouseUp, { passive: false });
  };

  private startMousePan = (initialEvent: MouseEvent) => {
    let previousOffset = getHTMLOffset(this._domElement, initialEvent.clientX, initialEvent.clientY);

    const onMouseMove = (event: MouseEvent) => {
      const newOffset = getHTMLOffset(this._domElement, event.clientX, event.clientY);
      const xDifference = newOffset.x - previousOffset.x;
      const yDifference = newOffset.y - previousOffset.y;
      previousOffset = newOffset;
      this.pan(xDifference, yDifference);
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: false });
    window.addEventListener('mouseup', onMouseUp, { passive: false });
  };

  private startTouchRotation = (initialEvent: TouchEvent) => {
    const { _domElement } = this;

    let previousOffset = getHTMLOffset(_domElement, initialEvent.touches[0].clientX, initialEvent.touches[0].clientY);

    const onTouchMove = (event: TouchEvent) => {
      if (event.touches.length !== 1) {
        return;
      }
      const newOffset = getHTMLOffset(_domElement, event.touches[0].clientX, event.touches[0].clientY);
      this.rotate(previousOffset.x - newOffset.x, previousOffset.y - newOffset.y);
      previousOffset = newOffset;
    };

    const onTouchStart = (event: TouchEvent) => {
      // if num fingers used don't equal 1 then we stop touch rotation
      if (event.touches.length !== 1) {
        dispose();
      }
    };

    const onTouchEnd = () => {
      dispose();
    };

    const dispose = () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };

    document.addEventListener('touchstart', onTouchStart);
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd, { passive: false });
  };

  private startTouchPinch = (initialEvent: TouchEvent) => {
    const { _domElement } = this;
    let previousPinchInfo = getPinchInfo(_domElement, initialEvent.touches);
    const initialPinchInfo = getPinchInfo(_domElement, initialEvent.touches);
    const initialRadius = this._spherical.radius;

    const onTouchMove = (event: TouchEvent) => {
      if (event.touches.length !== 2) {
        return;
      }
      const pinchInfo = getPinchInfo(_domElement, event.touches);
      // dolly
      const distanceFactor = initialPinchInfo.distance / pinchInfo.distance;
      // Min distance / 5 because on phones it is reasonable to get quite close to the target,
      // but we don't want to get too close since zooming slows down very close to target.
      this._sphericalEnd.radius = Math.max(distanceFactor * initialRadius, this.minDistance / 5);

      // pan
      const deltaCenter = pinchInfo.center.clone().sub(previousPinchInfo.center);
      if (deltaCenter.length() > this.pinchEpsilon) {
        deltaCenter.multiplyScalar(this.pinchPanSpeed);
        this.pan(deltaCenter.x, deltaCenter.y);
      }
      previousPinchInfo = pinchInfo;
    };

    const onTouchStart = (event: TouchEvent) => {
      // if num fingers used don't equal 2 then we stop touch pinch
      if (event.touches.length !== 2) {
        dispose();
      }
    };

    const onTouchEnd = () => {
      dispose();
    };

    const dispose = () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };

    document.addEventListener('touchstart', onTouchStart);
    document.addEventListener('touchmove', onTouchMove);
    document.addEventListener('touchend', onTouchEnd);
  };

  private handleKeyboard = () => {
    if (!this.enabled || !this.enableKeyboardNavigation || !this._isFocused) {
      return;
    }

    const { _keyboard, keyboardDollySpeed, keyboardPanSpeed, keyboardSpeedFactor } = this;

    // rotate
    const azimuthAngle =
      this.keyboardRotationSpeedAzimuth * (Number(_keyboard.isPressed('left')) - Number(_keyboard.isPressed('right')));
    let polarAngle =
      this.keyboardRotationSpeedPolar * (Number(_keyboard.isPressed('up')) - Number(_keyboard.isPressed('down')));

    if (azimuthAngle !== 0 || polarAngle !== 0) {
      const { _sphericalEnd } = this;
      const oldPhi = _sphericalEnd.phi;
      _sphericalEnd.phi += polarAngle;
      _sphericalEnd.makeSafe();
      polarAngle = _sphericalEnd.phi - oldPhi;
      _sphericalEnd.phi = oldPhi;
      this.rotateFirstPersonMode(azimuthAngle, polarAngle);
    }

    this._firstPersonMode = false;

    const speedFactor = _keyboard.isPressed('shift') ? keyboardSpeedFactor : 1;
    const moveForward = _keyboard.isPressed('w') ? true : _keyboard.isPressed('s') ? false : undefined;

    if (moveForward !== undefined) {
      this.dolly(0, 0, this.getDollyDeltaDistance(moveForward, keyboardDollySpeed * speedFactor), true);
      this._firstPersonMode = true;
    }

    // pan
    const horizontalMovement = Number(_keyboard.isPressed('a')) - Number(_keyboard.isPressed('d'));
    const verticalMovement = Number(_keyboard.isPressed('e')) - Number(_keyboard.isPressed('q'));
    if (horizontalMovement !== 0 || verticalMovement !== 0) {
      this.pan(speedFactor * keyboardPanSpeed * horizontalMovement, speedFactor * keyboardPanSpeed * verticalMovement);
      this._firstPersonMode = true;
    }
  };

  private rotateSpherical = (azimuthAngle: number, polarAngle: number) => {
    const { _sphericalEnd } = this;
    const theta = MathUtils.clamp(_sphericalEnd.theta + azimuthAngle, this.minAzimuthAngle, this.maxAzimuthAngle);
    const phi = MathUtils.clamp(_sphericalEnd.phi + polarAngle, this.minPolarAngle, this.maxPolarAngle);
    _sphericalEnd.theta = theta;
    _sphericalEnd.phi = phi;
    _sphericalEnd.makeSafe();
  };

  private rotateFirstPersonMode = (azimuthAngle: number, polarAngle: number) => {
    const { firstPersonRotationFactor, _reusableCamera, _reusableVector3, _sphericalEnd, _targetEnd } = this;

    _reusableCamera.position.setFromSpherical(_sphericalEnd).add(_targetEnd);
    _reusableCamera.lookAt(_targetEnd);

    _reusableCamera.rotateX(firstPersonRotationFactor * polarAngle);
    _reusableCamera.rotateY(firstPersonRotationFactor * azimuthAngle);

    const distToTarget = _targetEnd.distanceTo(_reusableCamera.position);
    _reusableCamera.getWorldDirection(_reusableVector3);
    _targetEnd.addVectors(_reusableCamera.position, _reusableVector3.multiplyScalar(distToTarget));
    _sphericalEnd.setFromVector3(_reusableVector3.subVectors(_reusableCamera.position, _targetEnd));

    _sphericalEnd.makeSafe();
  };

  private pan = (deltaX: number, deltaY: number) => {
    const { _domElement, _camera, _offsetVector, _target } = this;

    _offsetVector.copy(_camera.position).sub(_target);
    let targetDistance = Math.max(_offsetVector.length(), this.panDollyMinDistanceFactor * this.minDistance);

    // half of the fov is center to top of screen
    // @ts-ignore
    if (_camera.isPerspectiveCamera) {
      targetDistance *= Math.tan((((_camera as PerspectiveCamera).fov / 2) * Math.PI) / 180);
    }

    // we actually don't use screenWidth, since perspective camera is fixed to screen height
    this.panLeft((2 * deltaX * targetDistance) / _domElement.clientHeight);
    this.panUp((2 * deltaY * targetDistance) / _domElement.clientHeight);
  };

  private dollyOrthographicCamera = (_x: number, _y: number, deltaDistance: number) => {
    const camera = this._camera as OrthographicCamera;
    camera.zoom *= 1 - deltaDistance;
    camera.zoom = MathUtils.clamp(camera.zoom, this.minZoom, this.maxZoom);
    camera.updateProjectionMatrix();
  };

  private calculateTargetOfssetLerp = (x: number, y: number, deltaDistance: number, cameraDirection: THREE.Vector3) => {
    const { dynamicTarget, minDistance, _sphericalEnd, _raycaster, _targetEnd, _reusableCamera } = this;

    const distFromCameraToScreenCenter = Math.tan(
      MathUtils.degToRad(90 - (this._camera as PerspectiveCamera).fov * 0.5)
    );
    const distFromCameraToCursor = Math.sqrt(
      distFromCameraToScreenCenter * distFromCameraToScreenCenter + x * x + y * y
    );

    const ratio = distFromCameraToCursor / distFromCameraToScreenCenter;
    const distToTarget = cameraDirection.length();

    _raycaster.setFromCamera({ x, y }, _reusableCamera);

    let radius = distToTarget + deltaDistance;

    if (radius < minDistance) {
      radius = minDistance;
      if (dynamicTarget) {
        // push targetEnd forward
        _reusableCamera.getWorldDirection(cameraDirection);
        _targetEnd.add(cameraDirection.normalize().multiplyScalar(Math.abs(deltaDistance)));
      } else {
        // stops camera from moving forward
        deltaDistance = distToTarget - radius;
      }
    }

    const distFromRayOrigin = -deltaDistance * ratio;

    _sphericalEnd.radius = radius;

    _reusableCamera.getWorldDirection(cameraDirection);
    cameraDirection.normalize().multiplyScalar(deltaDistance);
    const rayDirection = _raycaster.ray.direction.normalize().multiplyScalar(distFromRayOrigin);
    const targetOffset = rayDirection.add(cameraDirection);

    return targetOffset;
  };

  private calculateTargetOfssetScrollTarget = (deltaDistance: number, cameraDirection: THREE.Vector3) => {
    const { minDistance, _reusableVector3, _sphericalEnd, _target, _scrollTarget, _camera } = this;

    const distToTarget = cameraDirection.length();

    // Here we use the law of sines to determine how far we want to move the target.
    // Direction is always determined by scrollTarget-target vector
    const targetToScrollTargetVec = _reusableVector3.subVectors(_scrollTarget, _target).normalize();
    const cameraToTargetVec = new Vector3().subVectors(_target, _camera.position);
    const cameraToScrollTargetVec = new Vector3().subVectors(_scrollTarget, _camera.position);

    const targetCameraScrollTargetAngle = cameraToTargetVec.angleTo(cameraToScrollTargetVec);
    const targetScrollTargetCameraAngle = targetToScrollTargetVec.negate().angleTo(cameraToScrollTargetVec.negate());

    let targetOffsetDistance =
      deltaDistance * (Math.sin(targetCameraScrollTargetAngle) / Math.sin(targetScrollTargetCameraAngle));

    const targetOffsetToDeltaratio = Math.abs(targetOffsetDistance / deltaDistance);

    // if target movement is too fast we want to slow it down a bit
    const downscaleCoefficient = targetOffsetToDeltaratio > 4 ? (targetOffsetToDeltaratio > 10 ? 0.4 : 0.2) : 1;
    deltaDistance *= downscaleCoefficient;
    targetOffsetDistance *= downscaleCoefficient;

    let radius = distToTarget + deltaDistance;

    // behaviour for scrolling with mouse wheel
    if (radius < minDistance) {
      this._temporarilyDisableDamping = true;

      // stops camera from moving forward only if target became close to scroll target
      if (_scrollTarget.distanceTo(_target) < minDistance) {
        radius = minDistance;
        targetOffsetDistance = 0;
      }
    }

    _sphericalEnd.radius = radius;

    // if we scroll out, we don't change the target
    const targetOffset = targetToScrollTargetVec.multiplyScalar(deltaDistance < 0 ? targetOffsetDistance : 0);

    return targetOffset;
  };

  private dollyWithWheelScroll = (x: number, y: number, deltaDistance: number, cameraDirection: THREE.Vector3) => {
    const { _targetEnd, useScrollTarget } = this;

    const targetOffset = useScrollTarget
      ? this.calculateTargetOfssetScrollTarget(deltaDistance, cameraDirection)
      : this.calculateTargetOfssetLerp(x, y, deltaDistance, cameraDirection);

    _targetEnd.add(targetOffset);
  };

  private dollyPerspectiveCamera = (x: number, y: number, deltaDistance: number, moveOnlyTarget: boolean = false) => {
    const { _reusableVector3, _targetEnd, _reusableCamera, _sphericalEnd, _camera } = this;

    //@ts-ignore
    _reusableCamera.copy(_camera);
    _reusableCamera.position.setFromSpherical(_sphericalEnd).add(_targetEnd);
    _reusableCamera.lookAt(_targetEnd);

    const cameraDirection = _reusableVector3.setFromSpherical(_sphericalEnd);

    if (moveOnlyTarget) {
      // move only target together with the camera, radius is constant (for 'w' and 's' keys movement)
      _reusableCamera.getWorldDirection(cameraDirection);
      _targetEnd.add(cameraDirection.normalize().multiplyScalar(-deltaDistance));
    } else this.dollyWithWheelScroll(x, y, deltaDistance, cameraDirection);
  };

  private dolly = (x: number, y: number, deltaDistance: number, moveTarget: boolean) => {
    const { _camera } = this;
    // @ts-ignore
    if (_camera.isOrthographicCamera) {
      this.dollyOrthographicCamera(x, y, deltaDistance);
      // @ts-ignore
    } else if (_camera.isPerspectiveCamera) {
      this.dollyPerspectiveCamera(x, y, deltaDistance, moveTarget);
    }
  };

  private getDollyDeltaDistance = (dollyIn: boolean, steps: number = 1) => {
    const { _sphericalEnd, dollyFactor } = this;
    const zoomFactor = dollyFactor ** steps;
    const factor = dollyIn ? zoomFactor : 1 / zoomFactor;
    const distance = Math.max(_sphericalEnd.radius, this.panDollyMinDistanceFactor * this.minDistance);
    return distance * (factor - 1);
  };

  private panLeft = (distance: number) => {
    const { _camera, _targetEnd, _panVector } = this;
    _panVector.setFromMatrixColumn(_camera.matrix, 0); // get X column of objectMatrix
    _panVector.multiplyScalar(-distance);
    _targetEnd.add(_panVector);
  };

  private panUp = (distance: number) => {
    const { _camera, _targetEnd, _panVector } = this;
    _panVector.setFromMatrixColumn(_camera.matrix, 1); // get Y column of objectMatrix
    _panVector.multiplyScalar(distance);
    _targetEnd.add(_panVector);
  };
}
