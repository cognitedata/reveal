/*!
 * Copyright 2022 Cognite AS
 */
import * as THREE from 'three';

import { CameraManager } from './CameraManager';
import { CameraChangeDelegate, CameraState } from './types';

export class ActiveCameraManager implements CameraManager {
  private readonly _cameraChangedListeners: Set<CameraChangeDelegate> = new Set();

  private _activeCameraManager: CameraManager;

  private readonly _activeCameraEventHandler: CameraChangeDelegate;

  set enabled(value: boolean) {
    const isEnabled = this._activeCameraManager.enabled;
    if (isEnabled === undefined) {
      throw new Error('Currently set Camera Manager does not support setting enabled state');
    }
    this._activeCameraManager.enabled = value;
  }

  get enabled(): boolean {
    const isEnabled = this._activeCameraManager.enabled;
    if (isEnabled === undefined) {
      throw new Error('Currently set Camera Manager does not support querying for enabled state');
    }
    return isEnabled;
  }

  get innerCameraManager(): CameraManager {
    return this._activeCameraManager;
  }

  constructor(initialActiveCamera: CameraManager) {
    this._activeCameraManager = initialActiveCamera;

    this._activeCameraEventHandler = (position, target) => this.onActiveCameraManagerEventFired(position, target);
    initialActiveCamera.on('cameraChange', this._activeCameraEventHandler);
  }

  public setActiveCameraManager(cameraManager: CameraManager, cameraStateUpdate = true): void {
    if (cameraStateUpdate) {
      const currentState = this._activeCameraManager.getCameraState();
      cameraManager.setCameraState({ position: currentState.position, target: currentState.target });
    }
    cameraManager.getCamera().aspect = this.getCamera().aspect;

    this._activeCameraManager.enabled = false;
    cameraManager.enabled = true;

    this._activeCameraManager.off('cameraChange', this._activeCameraEventHandler);
    this._activeCameraManager = cameraManager;
    this._activeCameraManager.on('cameraChange', this._activeCameraEventHandler);
  }

  public getCamera(): THREE.PerspectiveCamera {
    return this._activeCameraManager.getCamera();
  }

  public setCameraState(state: CameraState): void {
    this._activeCameraManager.setCameraState(state);
  }

  public getCameraState(): Required<CameraState> {
    return this._activeCameraManager.getCameraState();
  }

  public on(_: 'cameraChange', callback: CameraChangeDelegate): void {
    this._cameraChangedListeners.add(callback);
  }

  public off(_: 'cameraChange', callback: CameraChangeDelegate): void {
    this._cameraChangedListeners.delete(callback);
  }

  public fitCameraToBoundingBox(
    boundingBox: THREE.Box3,
    duration?: number | undefined,
    radiusFactor?: number | undefined
  ): void {
    this._activeCameraManager.fitCameraToBoundingBox(boundingBox, duration, radiusFactor);
  }

  public update(deltaTime: number, boundingBox: THREE.Box3): void {
    this._activeCameraManager.update(deltaTime, boundingBox);
  }

  public dispose(): void {
    this._activeCameraManager.dispose();
    this._cameraChangedListeners.clear();
  }

  private onActiveCameraManagerEventFired(position: THREE.Vector3, target: THREE.Vector3) {
    this._cameraChangedListeners.forEach(eventHandler => eventHandler(position, target));
  }
}
