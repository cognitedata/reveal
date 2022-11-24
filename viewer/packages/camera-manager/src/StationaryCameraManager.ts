/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';

import { CameraManager } from './CameraManager';
import { CameraManagerHelper } from './CameraManagerHelper';
import { CameraChangeDelegate, CameraState } from './types';

export class StationaryCameraManager implements CameraManager {
  private readonly _camera: THREE.PerspectiveCamera;
  private readonly _cameraChangedListener: Array<CameraChangeDelegate> = [];
  private readonly _domElement: HTMLElement;
  private readonly _defaultFOV: number;
  private _isEnabled = false;
  private _isDragging = false;

  constructor(domElement: HTMLElement, camera: THREE.PerspectiveCamera) {
    this._domElement = domElement;
    this._camera = camera;
    this._defaultFOV = camera.fov;

    domElement.addEventListener('pointermove', this.rotateCamera.bind(this));
    domElement.addEventListener('pointerdown', this.enableDragging.bind(this));
    domElement.addEventListener('pointerup', this.disableDragging.bind(this));
    domElement.addEventListener('pointerout', this.disableDragging.bind(this));
    domElement.addEventListener('wheel', this.zoomCamera.bind(this));
  }

  set enabled(value: boolean) {
    this._isEnabled = value;
  }

  get enabled(): boolean {
    return this._isEnabled;
  }

  getCamera(): THREE.PerspectiveCamera {
    return this._camera;
  }

  setCameraState(state: CameraState): void {
    const position = state.position ?? this._camera.position;
    const rotation = state.rotation ?? this._camera.quaternion;

    this._camera.position.copy(position);
    this._camera.quaternion.copy(rotation);
  }

  getCameraState(): Required<CameraState> {
    const unitForward = new THREE.Vector3(0, 0, -1);
    unitForward.applyQuaternion(this._camera.quaternion);
    return {
      position: this._camera.position,
      rotation: this._camera.quaternion,
      target: unitForward.add(this._camera.position)
    };
  }

  on(_: 'cameraChange', callback: CameraChangeDelegate): void {
    this._cameraChangedListener.push(callback);
  }

  off(_: 'cameraChange', callback: CameraChangeDelegate): void {
    const index = this._cameraChangedListener.indexOf(callback);
    if (index !== -1) {
      this._cameraChangedListener.splice(index, 1);
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

  update(_: number, boundingBox: THREE.Box3): void {
    CameraManagerHelper.updateCameraNearAndFar(this._camera, boundingBox);
  }

  dispose(): void {
    this._cameraChangedListener.splice(0);
    this._domElement.removeEventListener('pointermove', this.rotateCamera.bind(this));
    this._domElement.removeEventListener('pointerdown', this.enableDragging.bind(this));
    this._domElement.removeEventListener('pointerup', this.disableDragging.bind(this));
    this._domElement.removeEventListener('pointerout', this.disableDragging.bind(this));
    this._domElement.removeEventListener('wheel', this.zoomCamera.bind(this));
  }

  private enableDragging(_: PointerEvent) {
    this._isDragging = true;
  }

  private disableDragging(_: PointerEvent) {
    this._isDragging = false;
  }

  private rotateCamera(event: PointerEvent) {
    if (!this._isDragging || !this._isEnabled) {
      return;
    }

    const { movementX, movementY } = event;

    const euler = new THREE.Euler().setFromQuaternion(this._camera.quaternion, 'YXZ');

    euler.x -= movementY * 0.002;
    euler.y -= movementX * 0.002;
    euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.x));
    this._camera.quaternion.setFromEuler(euler);
    this._cameraChangedListener.forEach(cb => cb(this._camera.position, this._camera.position));
  }

  private zoomCamera(event: WheelEvent) {
    const sensitivityScaler = 0.05;
    this._camera.fov = Math.min(Math.max(this._camera.fov + event.deltaY * sensitivityScaler, 10), this._defaultFOV);
    this._camera.updateProjectionMatrix();
  }
}
