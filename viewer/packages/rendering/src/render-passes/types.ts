/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';

export type BlendOptions = {
  blendDestination: THREE.BlendingDstFactor;
  blendSource: THREE.BlendingDstFactor | THREE.BlendingSrcFactor;
  blendDestinationAlpha?: THREE.BlendingDstFactor;
  blendSourceAlpha?: THREE.BlendingDstFactor | THREE.BlendingSrcFactor;
};

export enum BlitEffect {
  None,
  GaussianBlur,
  Fxaa
}

export type BlitOptions = {
  texture: THREE.Texture;
  effect?: BlitEffect;
  depthTexture?: THREE.DepthTexture;
  ssaoTexture?: THREE.Texture;
  blendOptions?: BlendOptions;
  overrideAlpha?: number;
  edges?: boolean;
  outline?: boolean;
};

export type DepthBlendBlitOptions = {
  texture: THREE.Texture;
  depthTexture: THREE.DepthTexture;
  blendTexture: THREE.Texture;
  blendDepthTexture: THREE.Texture;
  blendFactor: number;
  overrideAlpha?: number;
  outline?: boolean;
};

export const transparentBlendOptions: BlendOptions = {
  blendDestination: THREE.OneMinusSrcAlphaFactor,
  blendSource: THREE.SrcAlphaFactor,
  blendDestinationAlpha: THREE.OneFactor,
  blendSourceAlpha: THREE.OneMinusDstAlphaFactor
};

export type ThreeUniforms = {
  [uniform: string]: THREE.IUniform<any>;
};

export type PointCloudPassParameters = {
  material?: {
    weighted?: boolean;
    hqDepthPass?: boolean;
    depthWrite?: boolean;
    blending?: THREE.Blending;
    blendSrc?: THREE.BlendingDstFactor | THREE.BlendingSrcFactor;
    blendDst?: THREE.BlendingDstFactor;
    colorWrite?: boolean;
  }; 
  renderer?: {
    autoClearDepth?: boolean;
    autoClearColor?: boolean;
  }
}
