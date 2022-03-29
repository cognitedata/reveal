/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import { BlitPass } from '../render-passes/BlitPass';
import { SSAOPass } from '../render-passes/SSAOPass';
import { RenderPass } from '../RenderPass';

export type RenderTargetData = {
  currentRenderSize: THREE.Vector2;
  opaqueComposition: THREE.WebGLRenderTarget;
  finalComposition: THREE.WebGLRenderTarget;
  color: THREE.WebGLRenderTarget;
  ghost: THREE.WebGLRenderTarget;
  inFront: THREE.WebGLRenderTarget;
  ssao: THREE.WebGLRenderTarget;
};

export type DefaultRenderPipelinePasses = {
  inFront: {
    geometry: RenderPass;
    blitToComposition: RenderPass;
    outline: RenderPass;
  };
  back: {
    geometry: RenderPass;
    blitToComposition: RenderPass;
    ssao: SSAOPass;
    blitSsaoBlur: RenderPass;
    edgeDetect: RenderPass;
    outline: RenderPass;
  };
  ghost: {
    geometry: RenderPass;
    blitToComposition: RenderPass;
  };
  custom: {
    geometry: RenderPass;
    deferred: RenderPass;
  };
  blitComposite: RenderPass;
  blitToOutput: BlitPass;
};
