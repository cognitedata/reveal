/*!
 * Copyright 2026 Cognite AS
 */

import type { WebGPURenderer } from 'three/webgpu';

/**
 * Reveal's production renderer type. WebGPURenderer with automatic WebGL2 fallback
 * when WebGPU is unavailable.
 */
export type RevealRenderer = WebGPURenderer;

export function isWebGPURenderer(renderer: unknown): renderer is RevealRenderer {
  return typeof renderer === 'object' && renderer !== null && 'isWebGPURenderer' in renderer && renderer.isWebGPURenderer === true;
}

export async function createRevealRenderer(): Promise<RevealRenderer> {
  const { WebGPURenderer } = await import('three/webgpu');
  const renderer = new WebGPURenderer({ antialias: false, powerPreference: 'high-performance' });
  await renderer.init();
  renderer.setPixelRatio(window.devicePixelRatio);
  return renderer;
}
