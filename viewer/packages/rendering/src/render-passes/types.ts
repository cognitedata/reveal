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
  writeColor?: boolean;
  edges?: boolean;
  outline?: boolean;
};

export const transparentBlendOptions: BlendOptions = {
  blendDestination: THREE.OneMinusSrcAlphaFactor,
  blendSource: THREE.SrcAlphaFactor,
  blendDestinationAlpha: THREE.OneFactor,
  blendSourceAlpha: THREE.OneMinusDstAlphaFactor
};

export const alphaMaskBlendOptions: BlendOptions = {
  blendDestination: THREE.SrcAlphaFactor,
  blendSource: THREE.ZeroFactor,
  blendDestinationAlpha: THREE.OneFactor,
  blendSourceAlpha: THREE.ZeroFactor
};

export type ThreeUniforms = {
  [uniform: string]: THREE.IUniform<any>;
};
