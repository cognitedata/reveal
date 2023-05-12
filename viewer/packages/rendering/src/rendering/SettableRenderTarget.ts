/*!
 * Copyright 2022 Cognite AS
 */

/**
 * Interface for allowing render targets in renderPipelines to be changed dynamicaly in RevealManager.
 */
export interface SettableRenderTarget {
  setOutputRenderTarget(target: THREE.WebGLRenderTarget | null, autoSizeRenderTarget?: boolean): void;
}
