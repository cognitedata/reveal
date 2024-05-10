/*!
 * Copyright 2022 Cognite AS
 */

import type { PerspectiveCamera, WebGLRenderer } from 'three';

/**
 * Delegate for pointer events.
 * @module @cognite/reveal
 */
export type PointerEventDelegate = (event: PointerEventData) => void;

/**
 * Data type for PointerEventDelegate.
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
  renderer: WebGLRenderer;
  camera: PerspectiveCamera;
}) => void;

/**
 * Delegate for event triggered when scene has been rendered.
 * @module @cognite/reveal
 */
export type SceneRenderedDelegate = (event: {
  frameNumber: number;
  renderTime: number;
  renderer: WebGLRenderer;
  camera: PerspectiveCamera;
}) => void;
