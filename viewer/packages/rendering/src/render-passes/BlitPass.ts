/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import { blitShaders } from '../rendering/shaders';
import { RenderPass } from '../RenderPass';
import { createFullScreenTriangleMesh, unitOrthographicCamera } from '../utilities/renderUtilities';

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
  blendOptions?: BlendOptions;
  overrideAlpha?: number;
};

export const transparentBlendOptions: BlendOptions = {
  blendDestination: THREE.OneMinusSrcAlphaFactor,
  blendSource: THREE.SrcAlphaFactor
};

export const alphaMaskBlendOptions: BlendOptions = {
  blendDestination: THREE.SrcAlphaFactor,
  blendSource: THREE.ZeroFactor,
  blendDestinationAlpha: THREE.OneFactor,
  blendSourceAlpha: THREE.ZeroFactor
};

export class BlitPass implements RenderPass {
  private readonly _renderTarget: THREE.WebGLRenderTarget;
  private readonly _fullScreenTriangle: THREE.Mesh;

  constructor(options: BlitOptions) {
    const { texture, effect, depthTexture, blendOptions, overrideAlpha } = options;

    const uniforms = {
      tDiffuse: { value: texture }
    };

    const defines = {};

    let depthTest = false;
    if (depthTexture !== undefined) {
      uniforms['tDepth'] = { value: depthTexture };
      defines['DEPTH_WRITE'] = true;
      depthTest = true;
    }

    if (overrideAlpha !== undefined) {
      uniforms['alpha'] = { value: overrideAlpha };
      defines['ALPHA'] = true;
    }

    const blitEffect = effect ?? BlitEffect.None;
    if (blitEffect === BlitEffect.GaussianBlur) {
      defines['GAUSSIAN_BLUR'] = true;
    } else if (blitEffect === BlitEffect.Fxaa) {
      defines['FXAA'] = true;
    }

    const blending = blendOptions !== undefined ? THREE.CustomBlending : THREE.NormalBlending;
    const blendDst = blendOptions?.blendDestination ?? THREE.OneMinusSrcAlphaFactor;
    const blendSrc = blendOptions?.blendSource ?? THREE.SrcAlphaFactor;
    const blendSrcAlpha = blendOptions?.blendSourceAlpha ?? null; // Uses blendSrc value if null
    const blendDstAlpha = blendOptions?.blendDestinationAlpha ?? null; // Uses blendDst value if null

    const blitShaderMaterial = new THREE.RawShaderMaterial({
      vertexShader: blitShaders.vertex,
      fragmentShader: blitShaders.fragment,
      uniforms,
      glslVersion: THREE.GLSL3,
      defines,
      depthTest,
      blending,
      blendDst,
      blendSrc,
      blendSrcAlpha,
      blendDstAlpha
    });

    this._fullScreenTriangle = createFullScreenTriangleMesh(blitShaderMaterial);
  }

  public getOutputRenderTarget(): THREE.WebGLRenderTarget | null {
    return this._renderTarget;
  }

  public render(renderer: THREE.WebGLRenderer, _: THREE.Camera): Promise<THREE.WebGLRenderTarget> {
    renderer.render(this._fullScreenTriangle, unitOrthographicCamera);
    return;
  }
}
