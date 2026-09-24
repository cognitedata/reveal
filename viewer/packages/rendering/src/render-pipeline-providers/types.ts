/*!
 * Copyright 2022 Cognite AS
 */

import type { Matrix4, Texture, Vector2, WebGLRenderTarget } from 'three';
import type { EdlOptions } from '../rendering/types';

export type CadShadowMap = {
  readonly depthTexture: Texture;
  readonly matrix: Matrix4;
  readonly texelWorldSize: number;
  readonly depthRange: number;
  readonly enabled: boolean;
};

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
    cadShadow?: {
      map: CadShadowMap;
    };
    edges: boolean;
    pointBlending?: boolean;
    edlOptions: EdlOptions;
  };
