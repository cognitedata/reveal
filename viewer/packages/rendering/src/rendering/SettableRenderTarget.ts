/*!
 * Copyright 2022 Cognite AS
 */

import type { WebGLRenderTarget, RenderTarget } from 'three';

/**
 * Interface for allowing render targets in renderPipelines to be changed dynamicaly in RevealManager.
 */
export interface SettableRenderTarget {
  setOutputRenderTarget(target: RenderTarget | WebGLRenderTarget | null, autoSizeRenderTarget?: boolean): void;
}
