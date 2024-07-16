/*!
 * Copyright 2021 Cognite AS
 */

import type { Box3, EventDispatcher, Quaternion, Vector3 } from 'three';

export type ControlsState = {
  position: Vector3;
  target: Vector3;
};

/**
 * @internal
 * */
export interface RevealCameraControls extends EventDispatcher {
  enabled: boolean;
  /**
   * Method for updating controls state
   */
  update: (deltaTime: number) => void;

  /**
   * Sets new state for controls
   */
  setState: (position: Vector3, target: Vector3) => void;

  /**
   * Method for getting current controls state
   */
  getState: () => { position: Vector3; target: Vector3 };

  /**
   * Sets view target (used for camera rotation animations) for controls.
   */
  setViewTarget: (target: Vector3) => void;

  /**
   * Sets scroll target (used for different scrolling mechanics) for controls.
   */
  setScrollTarget: (target: Vector3) => void;
}

export type CameraState = {
  /**
   * Camera position in world space.
   */
  position?: Vector3;
  /**
   * Camera target in world space.
   * **/
  target?: Vector3;
  /**
   * Camera local rotation in quaternion form.
   */
  rotation?: Quaternion;
};

/**
 * Delegate for camera update events.
 * @module @cognite/reveal
 */
export type CameraChangeDelegate = (position: Vector3, target: Vector3) => void;

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
    point: Vector3;
    /**
     * Distance from the camera to the intersection.
     */
    distanceToCamera: number;
  } | null;
  /**
   * Bounding box for all models on the scene
   */
  modelsBoundingBox: Box3;

  /**
   * Bounding box for the object (node in a model) that was picked
   */
  pickedBoundingBox: Box3 | undefined;
};

/**
 * List of supported event types (adapted from https://stackoverflow.com/questions/44480644/string-union-to-string-array)
 */
export const CAMERA_MANAGER_EVENT_TYPE_LIST = ['cameraChange', 'cameraStop'] as const;

/**
 * Union type of the supported camera manager event types
 */
export type CameraManagerEventType = (typeof CAMERA_MANAGER_EVENT_TYPE_LIST)[number];
