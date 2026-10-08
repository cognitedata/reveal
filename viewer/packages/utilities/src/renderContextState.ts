/*!
 * Copyright 2026 Cognite AS
 */

/**
 * Tracks whether the render context is lost. Auto-dispose paths (Potree LRU, Image360
 * cache) skip work while lost and resume once the context is restored.
 */

let contextLost = false;

export function isRenderContextLost(): boolean {
  return contextLost;
}

/**
 * @internal Called by Cognite3DViewer on `webglcontextlost` / `webglcontextrestored`.
 */
export function setRenderContextLost(lost: boolean): void {
  contextLost = lost;
}
