/*!
 * Copyright 2021 Cognite AS
 */

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

export type CameraState = {
  /**
   * Camera position in world space.
   */
  position?: THREE.Vector3;
  /**
   * Camera target in world space.
   * **/
  target?: THREE.Vector3;
  /**
   * Camera local rotation in quaternion form.
   */
  rotation?: THREE.Quaternion;
};

/**
 * Delegate for camera update events.
 * @module @cognite/reveal
 */
export type CameraChangeDelegate = (position: THREE.Vector3, target: THREE.Vector3) => void;

/**
 * Delegate for camera update events.
 * @module @cognite/reveal
 */
export type CameraStopDelegate = () => void;

/**
 * Union type of all camera event delegates
 */
export type CameraEventDelegate = CameraChangeDelegate | CameraStopDelegate;

/**
 * @beta
 */
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

  /**
   * Bounding box for the object (node in a model) that was picked
   */
  pickedBoundingBox: THREE.Box3 | undefined;
};

/**
 * List of supported event types (adapted from https://stackoverflow.com/questions/44480644/string-union-to-string-array)
 */
export const CAMERA_MANAGER_EVENT_TYPE_LIST: Array<CameraManagerEventType> = ['cameraChange', 'cameraStop'] as const;

/**
 * Union type of the supported camera manager event types
 */
export type CameraManagerEventType = 'cameraChange' | 'cameraStop';
