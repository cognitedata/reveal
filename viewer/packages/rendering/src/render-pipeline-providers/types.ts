/*!
 * Copyright 2022 Cognite AS
 */

import type { DepthTexture, Matrix4, Texture, Vector2, WebGLRenderTarget } from 'three';
import type { EdlOptions } from '../rendering/types';

/** Light-space CAD depth used to project view independent shadows. */
export type CadShadowMap = {
  readonly depthTexture: Texture;
  /** Light projection multiplied by light view, i.e. world space to light clip space. */
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
      receiverDepth: DepthTexture;
    };
    edges: boolean;
    pointBlending?: boolean;
    edlOptions: EdlOptions;
  };
