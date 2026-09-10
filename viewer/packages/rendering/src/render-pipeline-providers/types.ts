/*!
 * Copyright 2022 Cognite AS
 */

import type { Texture, Vector2, WebGLRenderTarget } from 'three';
import type { EdlOptions } from '../rendering/types';

export type RenderTargetData = {
  currentRenderSize: Vector2;
  ssaoRenderTarget: WebGLRenderTarget;
  postProcessingRenderTarget: WebGLRenderTarget;
};

export type CadGeometryRenderTargets = {
  currentRenderSize: Vector2;
  back: WebGLRenderTarget;
  ghost: WebGLRenderTarget;
  inFront: WebGLRenderTarget;
};

export type PointCloudRenderTargets = {
  pointCloudLogDepth: WebGLRenderTarget;
  pointCloud: WebGLRenderTarget;
};

export type PostProcessingPipelineOptions = CadGeometryRenderTargets &
  PointCloudRenderTargets & {
    ssaoTexture: Texture;
    edges: boolean;
    pointBlending?: boolean;
    edlOptions: EdlOptions;
  };
