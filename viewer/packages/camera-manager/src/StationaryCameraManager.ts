/*!
 * Copyright 2022 Cognite AS
 */

import { assertNever, pixelToNormalizedDeviceCoordinates } from '@reveal/utilities';
import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';

import pull from 'lodash/pull';

import { CameraManager } from './CameraManager';
import { CameraManagerHelper } from './CameraManagerHelper';
import {
  CameraChangeDelegate,
  CameraEventDelegate,
  CameraManagerEventType,
  CameraState,
  CameraStopDelegate
} from './types';
import { DebouncedCameraStopEventTrigger } from './utils/DebouncedCameraStopEventTrigger';

export class StationaryCameraManager implements CameraManager {
  private readonly _camera: THREE.PerspectiveCamera;
  private readonly _cameraChangedListeners: Array<CameraChangeDelegate> = [];
  private readonly _domElement: HTMLElement;
  private _defaultFOV: number;
  private readonly _minFOV: number;
  private readonly _stopEventTrigger: DebouncedCameraStopEventTrigger;
  private _isDragging = false;

  constructor(domElement: HTMLElement, camera: THREE.PerspectiveCamera) {
    this._domElement = domElement;
    this._camera = camera;
    this._defaultFOV = camera.fov;
    this._minFOV = 10.0;
    this._stopEventTrigger = new DebouncedCameraStopEventTrigger(this);
  }

  getCamera(): THREE.PerspectiveCamera {
    return this._camera;
  }

  get defaultFOV(): number {
    return this._defaultFOV;
  }

  // Stationary camera only reacts to rotation being set
  setCameraState(state: CameraState): void {
    const rotation = state.rotation ?? this._camera.quaternion;
    this._camera.quaternion.copy(rotation);
    this._cameraChangedListeners.forEach(cb => cb(this._camera.position, this.getTarget()));
  }

  getCameraState(): Required<CameraState> {
    return {
      position: this._camera.position,
      rotation: this._camera.quaternion,
      target: this.getTarget()
    };
  }

  activate(cameraManager: CameraManager): void {
    const { position, rotation } = cameraManager.getCameraState();
    this.setCameraState({ rotation });
    this._camera.position.copy(position);

    this._defaultFOV = cameraManager.getCamera().fov;

    this._camera.fov = this._defaultFOV;
    this._camera.aspect = cameraManager.getCamera().aspect;
    this._camera.updateProjectionMatrix();

    this._domElement.addEventListener('pointermove', this.rotateCamera);
    this._domElement.addEventListener('pointerdown', this.enableDragging);
    this._domElement.addEventListener('pointerup', this.disableDragging);
    this._domElement.addEventListener('pointerout', this.disableDragging);
    this._domElement.addEventListener('wheel', this.zoomCamera);
  }

  deactivate(): void {
    this._domElement.removeEventListener('pointermove', this.rotateCamera);
    this._domElement.removeEventListener('pointerdown', this.enableDragging);
    this._domElement.removeEventListener('pointerup', this.disableDragging);
    this._domElement.removeEventListener('pointerout', this.disableDragging);
    this._domElement.removeEventListener('wheel', this.zoomCamera);
  }

  on(eventType: CameraManagerEventType, callback: CameraEventDelegate): void {
    switch (eventType) {
      case 'cameraChange':
        this._cameraChangedListeners.push(callback);
        break;
      case 'cameraStop':
        this._stopEventTrigger.subscribe(callback as CameraStopDelegate);
        break;
      default:
        assertNever(eventType);
    }
  }

  off(eventType: CameraManagerEventType, callback: CameraChangeDelegate): void {
    switch (eventType) {
      case 'cameraChange':
        pull(this._cameraChangedListeners, callback);
        break;
      case 'cameraStop':
        this._stopEventTrigger.unsubscribe(callback as CameraStopDelegate);
        break;
      default:
        assertNever(eventType);
    }
  }

  fitCameraToBoundingBox(boundingBox: THREE.Box3, _?: number, radiusFactor?: number): void {
    const { position, target } = CameraManagerHelper.calculateCameraStateToFitBoundingBox(
      this._camera,
      boundingBox,
      radiusFactor
    );

    this.setCameraState({ position, target });
  }

  moveTo(targetPosition: THREE.Vector3, duration = 2000): Promise<void> {
    const from = { t: 0 };
    const to = { t: 1 };
    const { position } = this.getCameraState();
    const tween = new TWEEN.Tween(from)
      .to(to, duration)
      .onUpdate(() => {
        const temporaryPosition = new THREE.Vector3().lerpVectors(position, targetPosition, from.t);
        this._camera.position.copy(temporaryPosition);
      })
      .easing(num => TWEEN.Easing.Quintic.InOut(num))
      .start(TWEEN.now());

    return new Promise(resolve => {
      tween.onComplete(() => {
        tween.stop();
        resolve();
      });
    });
  }

  setFOV(fov: number): void {
    this._camera.fov = THREE.MathUtils.clamp(fov, this._minFOV, this._defaultFOV);
    this._cameraChangedListeners.forEach(cb => cb(this._camera.position, this.getTarget()));
  }

  update(_: number, boundingBox: THREE.Box3): void {
    CameraManagerHelper.updateCameraNearAndFar(this._camera, boundingBox);
  }

  dispose(): void {
    this.deactivate();
    this._cameraChangedListeners.splice(0);
    this._stopEventTrigger.dispose();
  }

  private readonly enableDragging = (_: PointerEvent) => {
    this._isDragging = true;
  };

  private readonly disableDragging = (_: PointerEvent) => {
    this._isDragging = false;
  };

  private readonly rotateCamera = (event: PointerEvent) => {
    if (!this._isDragging) {
      return;
    }

    const { movementX, movementY } = event;
    const sensitivityScaler = 0.0015;

    const euler = new THREE.Euler().setFromQuaternion(this._camera.quaternion, 'YXZ');

    euler.x -= -movementY * sensitivityScaler * (this._camera.fov / this._defaultFOV);
    euler.y -= -movementX * sensitivityScaler * (this._camera.fov / this._defaultFOV);
    euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.x));
    this._camera.quaternion.setFromEuler(euler);

    this._cameraChangedListeners.forEach(cb => cb(this._camera.position, this.getTarget()));
  };

  private readonly zoomCamera = (event: WheelEvent) => {
    const sensitivityScaler = 0.05;
    const newFov = Math.min(
      Math.max(this._camera.fov + event.deltaY * sensitivityScaler, this._minFOV),
      this._defaultFOV
    );

    if (this._camera.fov === newFov) return;

    const preCursorRay = this.getCursorRay(event).normalize();
    this._camera.fov = newFov;
    this._camera.updateProjectionMatrix();

    // When zooming the camera is rotated towards the cursor position
    const postCursorRay = this.getCursorRay(event).normalize();
    const arcBetweenRays = new THREE.Quaternion().setFromUnitVectors(postCursorRay, preCursorRay);
    const forwardVector = this._camera.getWorldDirection(new THREE.Vector3()).clone();

    forwardVector.applyQuaternion(arcBetweenRays);
    const targetWorldCoordinates = new THREE.Vector3().addVectors(this._camera.position, forwardVector);
    this._camera.lookAt(targetWorldCoordinates);
    this._cameraChangedListeners.forEach(cb => cb(this._camera.position, this.getTarget()));
  };

  private getCursorRay(event: WheelEvent) {
    const { width, height } = this._domElement.getBoundingClientRect();
    const ndcCoordinates = pixelToNormalizedDeviceCoordinates(event.clientX, event.clientY, width, height);
    const ray = new THREE.Vector3(ndcCoordinates.x, ndcCoordinates.y, 1)
      .unproject(this._camera)
      .sub(this._camera.position);
    return ray;
  }

  private getTarget(): THREE.Vector3 {
    const unitForward = new THREE.Vector3(0, 0, -1);
    unitForward.applyQuaternion(this._camera.quaternion);
    return unitForward.add(this._camera.position);
  }
}
