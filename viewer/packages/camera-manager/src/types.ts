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
export interface CameraManagerInterface {
  setCameraTarget: (target: THREE.Vector3) => void;
  getCameraTarget: () => THREE.Vector3;

  setCameraPosition: (position: THREE.Vector3) => void;
  getCameraPosition: () => THREE.Vector3;
  /**
   * Required for understadning of `cameraChanged` definition for other parts of Reveal
   * @param event 
   * @param callback 
   */
  on(event: 'cameraChange', callback: CameraChangeData): void;
  off(event: 'cameraChange', callback: CameraChangeData): void;

  fitCameraToBoundingBox(boundingBox: THREE.Box3, duration?: number, radiusFactor?: number): void;

  update(deltaTime: number, boundingBox: THREE.Box3): void;

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
