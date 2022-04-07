/*!
 * Copyright 2022 Cognite AS
 */

/**
 * Delegate for pointer events.
 */
export type PointerEventDelegate = (event: { offsetX: number; offsetY: number; button?: number }) => void;

/**
 * Delegate for camera update events.
 */
 export type CameraChangeDelegate = (position: THREE.Vector3, target: THREE.Vector3) => void;

/**
 * Delegate for disposal events.
 */
export type DisposedDelegate = () => void;

/**
 * Delegate for rendering events.
 */
export type SceneRenderedDelegate = (event: {
  frameNumber: number;
  renderTime: number;
  renderer: THREE.WebGLRenderer;
  camera: THREE.PerspectiveCamera;
}) => void;