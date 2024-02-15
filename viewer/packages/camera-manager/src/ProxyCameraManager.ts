/*!
 * Copyright 2022 Cognite AS
 */
import { Box3, PerspectiveCamera, Vector3 } from 'three';

import { CameraManager } from './CameraManager';
import {
  CameraChangeDelegate,
  CameraState,
  CameraManagerEventType,
  CAMERA_MANAGER_EVENT_TYPE_LIST,
  CameraStopDelegate,
  CameraEventDelegate
} from './types';

export class ProxyCameraManager implements CameraManager {
  private readonly _cameraEventListeners: Record<CameraManagerEventType, Set<CameraEventDelegate>>;
  private readonly _activeCameraEventHandlers: Record<CameraManagerEventType, CameraEventDelegate>;

  private _activeCameraManager: CameraManager;

  get innerCameraManager(): CameraManager {
    return this._activeCameraManager;
  }

  constructor(initialActiveCamera: CameraManager) {
    this._activeCameraManager = initialActiveCamera;

    this._activeCameraEventHandlers = {
      cameraChange: (position, target) => this.onActiveCameraManagerChangeFired(position, target),
      cameraStop: () => this.onActiveCameraManagerStopFired()
    };

    this._cameraEventListeners = {} as Record<CameraManagerEventType, Set<CameraEventDelegate>>;

    CAMERA_MANAGER_EVENT_TYPE_LIST.forEach(eventType => {
      initialActiveCamera.on(eventType, this._activeCameraEventHandlers[eventType]);
      this._cameraEventListeners[eventType] = new Set();
    });
  }

  public setActiveCameraManager(cameraManager: CameraManager): void {
    if (cameraManager === this._activeCameraManager) {
      return;
    }

    cameraManager.activate(this._activeCameraManager);
    this._activeCameraManager.deactivate();

    // Unregister event listeners from old camera manager
    CAMERA_MANAGER_EVENT_TYPE_LIST.forEach(eventType => {
      this._activeCameraManager.off(eventType, this._activeCameraEventHandlers[eventType]);
    });

    this._activeCameraManager = cameraManager;

    // Register event listeners on new camera manager
    CAMERA_MANAGER_EVENT_TYPE_LIST.forEach(eventType => {
      this._activeCameraManager.on(eventType, this._activeCameraEventHandlers[eventType]);
    });
  }

  public getCamera(): PerspectiveCamera {
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

  public on(eventType: 'cameraChange', callback: CameraChangeDelegate): void;
  public on(eventType: 'cameraStop', callback: CameraStopDelegate): void;
  public on(eventType: CameraManagerEventType, callback: CameraChangeDelegate): void {
    this._cameraEventListeners[eventType].add(callback);
  }

  public off(eventType: 'cameraChange', callback: CameraChangeDelegate): void;
  public off(eventType: 'cameraStop', callback: CameraStopDelegate): void;
  public off(eventType: CameraManagerEventType, callback: CameraEventDelegate): void {
    this._cameraEventListeners[eventType].delete(callback);
  }

  public fitCameraToBoundingBox(
    boundingBox: Box3,
    duration?: number | undefined,
    radiusFactor?: number | undefined
  ): void {
    this._activeCameraManager.fitCameraToBoundingBox(boundingBox, duration, radiusFactor);
  }

  public update(deltaTime: number, boundingBox: Box3): void {
    this._activeCameraManager.update(deltaTime, boundingBox);
  }

  public dispose(): void {
    this._activeCameraManager.dispose();

    CAMERA_MANAGER_EVENT_TYPE_LIST.forEach(eventType => {
      this._cameraEventListeners[eventType].clear();
    });
  }

  private onActiveCameraManagerChangeFired(position: Vector3, target: Vector3) {
    this._cameraEventListeners['cameraChange'].forEach(eventHandler =>
      (eventHandler as CameraChangeDelegate)(position, target)
    );
  }

  private onActiveCameraManagerStopFired() {
    this._cameraEventListeners['cameraStop'].forEach(eventHandler => (eventHandler as CameraStopDelegate)());
  }
}
