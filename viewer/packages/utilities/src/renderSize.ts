/*!
 * Copyright 2026 Cognite AS
 */

import { Vector2, type WebGLRenderer } from 'three';

const renderSizeOverrides = new WeakMap<WebGLRenderer, Vector2>();

/**
 * Size, in physical pixels, of the image currently being rendered. This is the renderer's drawing buffer size,
 * unless a different size is set with {@link setRenderSizeOverride}. Used for multi-view (e.g. WebXR stereo)
 * rendering, where each view is rendered at a size different from the drawing buffer.
 * Render passes must use this instead of `renderer.getDrawingBufferSize()`.
 */
export function getRenderSize(renderer: WebGLRenderer, target: Vector2): Vector2 {
  const override = renderSizeOverrides.get(renderer);
  return override === undefined ? renderer.getDrawingBufferSize(target) : target.copy(override);
}

/**
 * Like {@link getRenderSize}, but in CSS pixels (the equivalent of `renderer.getSize()`).
 */
export function getRenderCssSize(renderer: WebGLRenderer, target: Vector2): Vector2 {
  const override = renderSizeOverrides.get(renderer);
  return override === undefined
    ? renderer.getSize(target)
    : target.copy(override).divideScalar(renderer.getPixelRatio());
}

/**
 * Overrides the size reported by {@link getRenderSize} for the given renderer. Pass `undefined` to clear.
 */
export function setRenderSizeOverride(renderer: WebGLRenderer, size: Vector2 | undefined): void {
  if (size === undefined) {
    renderSizeOverrides.delete(renderer);
  } else {
    renderSizeOverrides.set(renderer, new Vector2().copy(size));
  }
}
