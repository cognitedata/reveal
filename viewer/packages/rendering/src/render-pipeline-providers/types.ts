/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';

export type RenderTargetData = {
  currentRenderSize: THREE.Vector2;
  ssaoRenderTarget: THREE.WebGLRenderTarget;
  postProcessingRenderTarget: THREE.WebGLRenderTarget;
};

export type CadGeometryRenderTargets = {
  currentRenderSize: THREE.Vector2;
  back: THREE.WebGLRenderTarget;
  ghost: THREE.WebGLRenderTarget;
  inFront: THREE.WebGLRenderTarget;
};

export type PostProcessingPipelineOptions = CadGeometryRenderTargets & {
  ssaoTexture: THREE.Texture;
  edges: boolean;
};
