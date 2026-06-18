/*!
 * Copyright 2026 Cognite AS
 */

import { WebGLRenderer } from 'three';
import { WebGPURenderer } from 'three/webgpu';

import type { TestRendererKind } from './testRendererKind';

export type TestRenderer = WebGLRenderer | WebGPURenderer;

export async function createTestRenderer(kind: TestRendererKind): Promise<TestRenderer> {
  if (kind === 'webgpu') {
    const renderer = new WebGPURenderer({ antialias: false });
    await renderer.init();
    return renderer;
  }

  return new WebGLRenderer();
}
