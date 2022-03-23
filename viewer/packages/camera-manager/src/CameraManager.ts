/*!
 * Copyright 2022 Cognite AS
 */

import { CameraChangeDelegate, CameraState } from './types';

/**
 * Interface for manager responsible for all manipulations to the camera,
 * including animations and modification of state. Implementations are responsible for
 * providing a `THREE.PerspectiveCamera` instance to {@link Cognite3DViewer}. Implementations
 * must trigger the `cameraChange`-event when camera is changed.
 * The default implementation is {@link DefaultCameraManager}.
 */
export interface CameraManager {
  /**
   * Returns the camera used for rendering in {@link Cognite3DViewer}.
   * Note that the camera will not be modified directly by Reveal.
   * Implementations must trigger the `cameraChange`-event whenever the
   * camera changes.
   */
  getCamera(): THREE.PerspectiveCamera;
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
   * Subscribes to changes of the camera event. This is used by Reveal to react on changes of the camera.
   * @param event Name of the event.
   * @param callback Callback to be called when the event is fired.
   */
  on(event: 'cameraChange', callback: CameraChangeDelegate): void;
  /**
   * Unsubscribes from changes of the camera event.
   * @param event Name of the event.
   * @param callback Callback function to be unsubscribed.
   */
  off(event: 'cameraChange', callback: CameraChangeDelegate): void;

  /**
   * Moves camera to a place where the content of a bounding box is visible to the camera.
   * @param box The bounding box in world space.
   * @param duration The duration of the animation moving the camera.
   * @param radiusFactor The ratio of the distance from camera to center of box and radius of the box.
   */
  fitCameraToBoundingBox(boundingBox: THREE.Box3, duration?: number, radiusFactor?: number): void;
  /**
   * Updates internal state of camera manager. Expected to update visual state of the camera
   * as well as it's near and far planes if needed. Called in `requestAnimationFrame`-loop.
   * Reveal performance affects frequency with which this method is called.
   * @param deltaTime Delta time since last update in seconds.
   * @param boundingBox Global bounding box of the model(s) and any custom objects added to the scene.
   */
  update(deltaTime: number, boundingBox: THREE.Box3): void;
  /**
   * @obvious
   */
  dispose(): void;
}
