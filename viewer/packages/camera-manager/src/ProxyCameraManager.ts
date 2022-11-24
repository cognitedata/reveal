/*!
 * Copyright 2022 Cognite AS
 */
import * as THREE from 'three';

import { CameraManager } from './CameraManager';
import { CameraChangeDelegate, CameraState } from './types';

export class ProxyCameraManager implements CameraManager {
  private readonly _cameraChangedListeners: Set<CameraChangeDelegate> = new Set();

  private _activeCameraManager: CameraManager;

  private readonly _activeCameraEventHandler: CameraChangeDelegate;

  get enabled(): boolean {
    return this._activeCameraManager.enabled;
  }

  get innerCameraManager(): CameraManager {
    return this._activeCameraManager;
  }

  constructor(initialActiveCamera: CameraManager) {
    this._activeCameraManager = initialActiveCamera;

    this._activeCameraEventHandler = (position, target) => this.onActiveCameraManagerEventFired(position, target);
    initialActiveCamera.on('cameraChange', this._activeCameraEventHandler);
  }

  public setActiveCameraManager(cameraManager: CameraManager): void {
    if (cameraManager === this._activeCameraManager) {
      return;
    }

    cameraManager.activate(this._activeCameraManager);
    this._activeCameraManager.deactivate();

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

  activate(cameraManager?: CameraManager): void {
    this._activeCameraManager.activate(cameraManager);
  }

  deactivate(): void {
    this._activeCameraManager.deactivate();
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
