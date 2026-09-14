/*!
 * Copyright 2026 Cognite AS
 */

/**
 * Tracks whether the WebGL context is lost; auto-dispose paths (Potree LRU, Image360
 * cache) should skip work while lost and resume after `webglcontextrestored`.
 */

let contextLost = false;

export function isWebGLContextLost(): boolean {
  return contextLost;
}

/**
 * @internal Called by Cognite3DViewer when the canvas fires
 * `webglcontextlost` / `webglcontextrestored`. Not intended for user code.
 */
export function setWebGLContextLost(lost: boolean): void {
  contextLost = lost;
}
