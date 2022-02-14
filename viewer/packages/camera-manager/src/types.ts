/*!
 * Copyright 2021 Cognite AS
 */

export type CameraControlsOptions = {
  /**
   * Sets mouse wheel initiated action.
   *
   * Modes:
   *
   * 'zoomToTarget' - zooms just to the current target (center of the screen) of the camera.
   *
   * 'zoomPastCursor' - zooms in the direction of the ray coming from camera through cursor screen position, allows going through objects.
   *
   * 'zoomToCursor' - mouse wheel scroll zooms towards the point on the model where cursor is hovering over, doesn't allow going through objects.
   *
   * Default is 'zoomPastCursor'.
   *
   */
  mouseWheelAction?: 'zoomToTarget' | 'zoomPastCursor' | 'zoomToCursor';
  /**
   * Enables or disables change of camera target on mouse click. New target is then set to the point of the model under current cursor position.
   *
   * Default is false.
   *
   */
  changeCameraTargetOnClick?: boolean;
};

export type ControlsState = {
  position: THREE.Vector3;
  target: THREE.Vector3;
};
/**
 * @internal
 * */
export interface RevealCameraControls extends THREE.EventDispatcher {
  enabled: boolean;
  /**
   * Method for updating controls state
   */
  update: (deltaTime: number) => void;

  /**
   * Sets new state for controls
   */
  setState: (position: THREE.Vector3, target: THREE.Vector3) => void;

  /**
   * Method for getting current controls state
   */
  getState: () => { position: THREE.Vector3; target: THREE.Vector3 };

  /**
   * Sets view target (used for camera rotation animations) for controls.
   */
  setViewTarget: (target: THREE.Vector3) => void;

  /**
   * Sets scroll target (used for different scrolling mechanics) for controls.
   */
  setScrollTarget: (target: THREE.Vector3) => void;
}
/**
 * Camera manager interface.
 * */
export interface CameraManager {
  getCamera(): THREE.PerspectiveCamera;

  /**
   * Sets camera rotation.
   * @param rotation
   */
  setCameraRotation(rotation: THREE.Quaternion): void;
  /**
   * @obvious
   * @returns camera rotation as a quaternion
   * */
  getCameraRotation(): THREE.Quaternion;

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
  setCameraTarget: (target: THREE.Vector3) => void;
  /**
   * @obvious
   * @returns Camera's target in world space.
   */
  getCameraTarget: () => THREE.Vector3;

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
  setCameraPosition: (position: THREE.Vector3) => void;
  /**
   * @obvious
   * @returns Camera's position in world space.
   */
  getCameraPosition: () => THREE.Vector3;
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
export type CameraManagerCallbackData = {
  intersection: {
    /**
     * Coordinate of the intersection.
     */
    point: THREE.Vector3;
    /**
     * Distance from the camera to the intersection.
     */
    distanceToCamera: number;
  } | null;
  /**
   * Bounding box for all models on the scene
   */
  modelsBoundingBox: THREE.Box3;
};

/**
 * Delegate for pointer events.
 * @module @cognite/reveal
 */
export type PointerEventDelegate = (event: { offsetX: number; offsetY: number }) => void;

/**
 * Type defining camera change event data.
 */
export type CameraChangeData = (event: { camera: { position: THREE.Vector3; target: THREE.Vector3 } }) => void;
