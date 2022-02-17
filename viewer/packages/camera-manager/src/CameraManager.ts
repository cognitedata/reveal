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
   * Sets camera rotation.
   * @param rotation
   */
  //setCameraRotation(rotation: THREE.Quaternion): void;
  /**
   * @obvious
   * @returns camera rotation as a quaternion
   * */
  //getCameraRotation(): THREE.Quaternion;

  /**
   * Set camera's target.
   * @public
   * @param target Target in world space.
   * @param animated Whether change of target should be animated or not (default is false).
   * @example
   * ```js
   * // store position, target
   * const position = cameraManager.getCameraPosition();
   * const target = cameraManager.getCameraTarget();
   * // restore position, target
   * cameraManager.setCameraPosition(position);
   * cameraManager.setCameraTarget(target);
   * ```
   */
  //setCameraTarget: (target: THREE.Vector3) => void;
  /**
   * @obvious
   * @returns Camera's target in world space.
   */
  //getCameraTarget: () => THREE.Vector3;

  /**
   * @obvious
   * @param position Position in world space.
   * @example
   * ```js
   * // store position, target
   * const position = viewer.getCameraPosition();
   * const target = viewer.getCameraTarget();
   * // restore position, target
   * viewer.setCameraPosition(position);
   * viewer.setCameraTarget(target);
   * ```
   */
  //setCameraPosition: (position: THREE.Vector3) => void;
  /**
   * @obvious
   * @returns Camera's position in world space.
   */
  //getCameraPosition: () => THREE.Vector3;
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
