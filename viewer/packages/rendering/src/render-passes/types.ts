/*!
 * Copyright 2022 Cognite AS
 */

import type { PointShape } from '../pointcloud-rendering';
import type { Blending, BlendingDstFactor, BlendingSrcFactor, DepthTexture, IUniform, Texture } from 'three';
import { OneFactor, OneMinusDstAlphaFactor, OneMinusSrcAlphaFactor, SrcAlphaFactor } from 'three';
import type { EdlOptions } from '../rendering/types';

export type BlendOptions = {
  blendDestination: BlendingDstFactor;
  blendSource: BlendingDstFactor | BlendingSrcFactor;
  blendDestinationAlpha?: BlendingDstFactor;
  blendSourceAlpha?: BlendingDstFactor | BlendingSrcFactor;
};

export enum BlitEffect {
  None,
  GaussianBlur,
  Fxaa
}

export type BlitOptions = {
  texture: Texture;
  effect?: BlitEffect;
  depthTexture: DepthTexture | null;
  ssaoTexture?: Texture;
  blendOptions?: BlendOptions;
  overrideAlpha?: number;
  edges?: boolean;
  outline?: boolean;
};

export type DepthBlendBlitOptions = {
  texture: Texture;
  depthTexture: DepthTexture | null;
  blendTexture: Texture;
  blendDepthTexture: Texture | null;
  blendFactor: number;
  overrideAlpha?: number;
  outline?: boolean;
};

export type PointCloudPostProcessingOptions = {
  logDepthTexture: Texture;
  texture: Texture;
  depthTexture: DepthTexture | null;
  pointBlending: boolean;
  edlOptions: EdlOptions;
};

export const transparentBlendOptions: BlendOptions = {
  blendDestination: OneMinusSrcAlphaFactor,
  blendSource: SrcAlphaFactor,
  blendDestinationAlpha: OneFactor,
  blendSourceAlpha: OneMinusDstAlphaFactor
};

export type ThreeUniforms = {
  [uniform: string]: IUniform<any>;
};

export type PointCloudMaterialParameters = {
  weighted?: boolean;
  shape?: PointShape;
  useEDL?: boolean;
  hqDepthPass?: boolean;
  depthWrite?: boolean;
  blending?: Blending;
  blendSrc?: BlendingDstFactor | BlendingSrcFactor;
  blendDst?: BlendingDstFactor;
  colorWrite?: boolean;
};

export type PointCloudPassParameters = {
  material?: PointCloudMaterialParameters;
  renderer?: {
    autoClearDepth?: boolean;
  };
};

export type PostProcessingObjectsVisibilityParameters = {
  cad: {
    back: boolean;
    ghost: boolean;
    inFront: boolean;
  };
  pointCloud: boolean;
};
