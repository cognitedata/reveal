/*!
 * Copyright 2022 Cognite AS
 */

import { CameraChangeData, CameraState } from './types';
/**
 * Camera manager interface.
 * */
export interface CameraManager {
  /**
   * Get THREE.PerspectiveCamera object for special cases. All manipulations of the camera should be done
   * through other CameraManager methods.
   * **/
  getCamera(): THREE.PerspectiveCamera;
  /**
   * Set camera's state
   *
   * @param state Camera state, all fields are optional.
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
   */
  getCameraState(): Required<CameraState>;
  
  /**
   * Required for understadning of `cameraChanged` definition for other parts of Reveal
   * @param event
   * @param callback
   */
  on(event: 'cameraChange', callback: CameraChangeData): void;
  /**
   * Required for understadning of `cameraChanged` definition for other parts of Reveal
   * @param event
   * @param callback
   */
  off(event: 'cameraChange', callback: CameraChangeData): void;

  fitCameraToBoundingBox(boundingBox: THREE.Box3, duration?: number, radiusFactor?: number): void;
  /**
   * Updates internal state of camera manager.
   * @param deltaTime
   * @param boundingBox
   */
  update(deltaTime: number, boundingBox: THREE.Box3): void;
  /**
   * @obvious
   */
  dispose(): void;
}
