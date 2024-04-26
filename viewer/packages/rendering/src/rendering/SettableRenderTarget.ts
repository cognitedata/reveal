/*!
 * Copyright 2022 Cognite AS
 */

import type { WebGLRenderTarget } from 'three';

/**
 * Interface for allowing render targets in renderPipelines to be changed dynamicaly in RevealManager.
 */
export interface SettableRenderTarget {
  setOutputRenderTarget(target: WebGLRenderTarget | null, autoSizeRenderTarget?: boolean): void;
}
