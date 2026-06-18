/*!
 * Copyright 2022 Cognite AS
 */

import type { RenderTarget, Texture, Vector2 } from 'three';
import type { EdlOptions } from '../rendering/types';

export type RenderTargetData = {
  currentRenderSize: Vector2;
  ssaoRenderTarget: RenderTarget;
  postProcessingRenderTarget: RenderTarget;
};

export type CadGeometryRenderTargets = {
  currentRenderSize: Vector2;
  back: RenderTarget;
  ghost: RenderTarget;
  inFront: RenderTarget;
};

export type PointCloudRenderTargets = {
  pointCloudLogDepth: RenderTarget;
  pointCloud: RenderTarget;
};

export type PostProcessingPipelineOptions = CadGeometryRenderTargets &
  PointCloudRenderTargets & {
    ssaoTexture: Texture;
    edges: boolean;
    pointBlending?: boolean;
    edlOptions: EdlOptions;
  };
