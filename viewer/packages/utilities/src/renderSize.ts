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
 * The size set with {@link setRenderSizeOverride}, or undefined when there is none.
 */
export function getRenderSizeOverride(renderer: WebGLRenderer): Vector2 | undefined {
  return renderSizeOverrides.get(renderer)?.clone();
}

/**
 * How much the rendered image is downscaled relative to the canvas on the page: `renderWidth` (in the same unit as
 * the canvas' CSS width, or physical pixels to include the pixel ratio) divided by the canvas' CSS width.
 * Returns 1 while a render size override is active (e.g. in WebXR, where the page canvas isn't what's displayed)
 * or when the canvas has no size.
 */
export function getRenderDownScale(renderer: WebGLRenderer, renderWidth: number): number {
  const cssWidth = renderer.domElement.clientWidth;
  if (renderSizeOverrides.has(renderer) || cssWidth <= 0) {
    return 1;
  }
  return renderWidth / cssWidth;
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
