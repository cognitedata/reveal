/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';

export interface RenderPass {
  render(renderer: THREE.WebGLRenderer, camera: THREE.Camera): Promise<THREE.WebGLRenderTarget | undefined>;
  getOutputRenderTarget(): THREE.WebGLRenderTarget | null;
}
