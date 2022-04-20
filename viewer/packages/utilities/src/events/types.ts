/*!
 * Copyright 2022 Cognite AS
 */

/**
 * Delegate for pointer events.
 * @module @cognite/reveal
 */
export type PointerEventDelegate = (event: { offsetX: number; offsetY: number; button?: number }) => void;

/**
 * Delegate for disposal events.
 * @module @cognite/reveal
 */
export type DisposedDelegate = () => void;

/**
 * Delegate for rendering events.
 * @module @cognite/reveal
 */
export type SceneRenderedDelegate = (event: {
  frameNumber: number;
  renderTime: number;
  renderer: THREE.WebGLRenderer;
  camera: THREE.PerspectiveCamera;
}) => void;
