/*!
 * Copyright 2022 Cognite AS
 */
import { Box3, PerspectiveCamera } from 'three';
import {
  CameraState,
  CameraChangeDelegate,
  CameraStopDelegate,
  CameraManagerEventType,
  CameraEventDelegate
} from './types';

import { DefaultCameraManager } from './DefaultCameraManager';

/**
 * Interface for manager responsible for all manipulations to the camera,
 * including animations and modification of state. Implementations are responsible for
 * providing a `THREE.PerspectiveCamera` instance to the viewer. Implementations
 * must trigger the `cameraChange`-event when camera is changed.
 * The default implementation is {@link DefaultCameraManager}.
 */
export interface CameraManager {
  /**
   * Returns the camera used for rendering the viewer.
   * Note that the camera will not be modified directly by Reveal.
   * Implementations must trigger the `cameraChange`-event whenever the
   * camera changes.
   */
  getCamera(): PerspectiveCamera;
  /**
   * Set camera's state. Rotation and target can't be set at the same time as they could conflict,
   * should throw an error if both are passed with non-zero value inside state.
   *
   * @param state Camera state, all fields are optional.
   * @param state.position Camera position in world space.
   * @param state.target Camera target in world space.
   * @param state.rotation Camera local rotation in quaternion form.
   * @example
   * ```js
   * // store position, target
   * const { position, target } = cameraManager.getCameraState();
   * // restore position, target
   * cameraManager.setCameraState({ position, target });
   * ```
   */
  setCameraState(state: CameraState): void;

  /**
   * Get camera's state
   * @returns Camera state: position, target and rotation.
   */
  getCameraState(): Required<CameraState>;

  /**
   * Set this manager as active and enable controls.
   *
   * Should update {@link CameraManager.enabled} to reflect the state of the manager.
   * Note that this is called automatically when a new CameraManager is set on the viewer.
   * @param cameraManager Previously used camera manager.
   */
  activate(cameraManager?: CameraManager): void;

  /**
   * Deactivate this manager and disable controls.
   *
   * Should update {@link CameraManager.enabled} to reflect the state of the manager.
   * Note that this is called automatically when a new CameraManager is set on the viewer.
   */
  deactivate(): void;

  /**
   * Subscribes to events on this camera manager. There are several event types:
   * 'cameraChange' - Subscribes to changes of the camera. This is used by Reveal to react on changes of the camera.
   * 'cameraStop' - Subscribes to events indicating the camera has stopped
   * @param event The event type.
   * @param callback Callback to be called when the event is fired.
   */
  on(event: 'cameraChange', callback: CameraChangeDelegate): void;
  on(event: 'cameraStop', callback: CameraStopDelegate): void;
  on(event: CameraManagerEventType, callback: CameraEventDelegate): void;

  /**
   * Unsubscribes from changes of the camera event.
   * @param event The event type.
   * @param callback Callback function to be unsubscribed.
   */
  off(event: 'cameraChange', callback: CameraChangeDelegate): void;
  off(event: 'cameraStop', callback: CameraStopDelegate): void;
  off(event: CameraManagerEventType, callback: CameraEventDelegate): void;

  /**
   * Moves camera to a place where the content of a bounding box is visible to the camera.
   * @param boundingBox The bounding box in world space.
   * @param duration The duration of the animation moving the camera.
   * @param radiusFactor The ratio of the distance from camera to center of box and radius of the box.
   */
  fitCameraToBoundingBox(boundingBox: Box3, duration?: number, radiusFactor?: number): void;
  /**
   * Updates internal state of camera manager. Expected to update visual state of the camera
   * as well as it's near and far planes if needed. Called in `requestAnimationFrame`-loop.
   * Reveal performance affects frequency with which this method is called.
   * @param deltaTime Delta time since last update in seconds.
   * @param boundingBox Global bounding box of the model(s) and any custom objects added to the scene.
   */
  update(deltaTime: number, boundingBox: Box3): void;
  /**
   * @obvious
   */
  dispose(): void;
}
