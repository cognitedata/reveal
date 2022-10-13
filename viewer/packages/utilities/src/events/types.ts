/*!
 * Copyright 2022 Cognite AS
 */

/**
 * Delegate for pointer events.
 * @module @cognite/reveal
 */
export type PointerEventDelegate = (event: PointerEventData) => void;

/**
 * Data typr for PointerEventDelegate.
 * @module @cognite/reveal
 */
export type PointerEventData = { offsetX: number; offsetY: number; button?: number };
/**
 * Delegate for disposal events.
 * @module @cognite/reveal
 */
export type DisposedDelegate = () => void;

/**
 * Delegate for event triggered when scene is about to be rendered.
 */
export type BeforeSceneRenderedDelegate = (event: {
  frameNumber: number;
  renderer: THREE.WebGLRenderer;
  camera: THREE.PerspectiveCamera;
}) => void;

/**
 * Delegate for event triggered when scene has been rendered.
 * @module @cognite/reveal
 */
export type SceneRenderedDelegate = (event: {
  frameNumber: number;
  renderTime: number;
  renderer: THREE.WebGLRenderer;
  camera: THREE.PerspectiveCamera;
}) => void;
