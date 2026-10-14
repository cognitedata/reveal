/*!
 * Copyright 2026 Cognite AS
 */

import type { Camera, Mesh, Texture, WebGLRenderer } from 'three';
import {
  FloatType,
  GLSL3,
  LinearFilter,
  Matrix4,
  NearestFilter,
  RawShaderMaterial,
  RGBAFormat,
  UnsignedByteType,
  Vector2,
  Vector3,
  WebGLRenderTarget
} from 'three';
import { ambientOcclusionShaders } from '../rendering/shaders';
import type { SsaoParameters } from '../rendering/types';
import type { RenderPass } from '../RenderPass';
import { createFullScreenTriangleMesh, unitOrthographicCamera } from '../utilities/renderUtilities';

/**
 * Render height that {@link SsaoParameters.screenSpaceRadius} is defined relative to.
 */
export const AMBIENT_OCCLUSION_REFERENCE_HEIGHT = 1080;

type ShaderPair = { vertex: string; fragment: string };

/**
 * Screen-space ambient occlusion based on N8AO (https://github.com/N8python/n8ao, CC0 1.0).
 *
 * Renders into the render target that is bound when {@link render} is called, which must have the full render size.
 * The output's red channel holds the ambient occlusion factor (1 = unoccluded) with the intensity applied,
 * ready to be multiplied with the scene color. Steps:
 * 1. With {@link SsaoParameters.halfResolution}: downsample depth and reconstruct normals at half resolution.
 * 2. Hemisphere sampling around normals reconstructed from depth, with a radius given in pixels.
 * 3. Depth- and normal-aware Poisson disk denoising (ping-pong between two targets).
 * 4. With {@link SsaoParameters.halfResolution}: depth-aware upsampling into the output.
 *
 * At full resolution, the last step writes directly into the output.
 */
export class AmbientOcclusionPass implements RenderPass {
  private readonly _depthTexture: Texture | null;
  private _parameters: SsaoParameters;
  private readonly _renderSize = new Vector2(1, 1);
  private _halfResolutionSupported = true;
  private _checkedFloatRenderTargetSupport = false;

  private readonly _depthDownsampleTarget: WebGLRenderTarget;
  private readonly _ambientOcclusionTargets: [WebGLRenderTarget, WebGLRenderTarget];

  private readonly _depthDownsampleMaterial: RawShaderMaterial;
  private readonly _ambientOcclusionMaterial: RawShaderMaterial;
  private readonly _denoiseMaterial: RawShaderMaterial;
  private readonly _upsampleMaterial: RawShaderMaterial;
  private readonly _fullScreenTriangle: Mesh;

  constructor(depthTexture: Texture | null, parameters: SsaoParameters) {
    this._depthTexture = depthTexture;
    this._parameters = { ...parameters };

    this._depthDownsampleTarget = createIntermediateTarget(FloatType, NearestFilter);
    this._ambientOcclusionTargets = [
      createIntermediateTarget(UnsignedByteType, LinearFilter),
      createIntermediateTarget(UnsignedByteType, LinearFilter)
    ];

    this._depthDownsampleMaterial = createMaterial(ambientOcclusionShaders.depthDownsample, {
      tDepth: { value: depthTexture }
    });
    this._ambientOcclusionMaterial = createMaterial(ambientOcclusionShaders.ambientOcclusion, {
      tDepth: { value: depthTexture },
      fullResolution: { value: new Vector2(1, 1) },
      samples: { value: [] },
      radius: { value: 0 },
      distanceFalloff: { value: 0 },
      outputExponent: { value: 1 }
    });
    this._denoiseMaterial = createMaterial(ambientOcclusionShaders.denoise, {
      tAmbientOcclusion: { value: null },
      tDepth: { value: depthTexture },
      fullResolution: { value: new Vector2(1, 1) },
      poissonDisk: { value: [] },
      denoiseRadius: { value: 0 },
      radius: { value: 0 },
      distanceFalloff: { value: 0 },
      iteration: { value: 0 },
      outputExponent: { value: 1 }
    });
    this._upsampleMaterial = createMaterial(ambientOcclusionShaders.upsample, {
      tDepth: { value: depthTexture },
      tDownsampledDepth: { value: this._depthDownsampleTarget.texture },
      tAmbientOcclusion: { value: null },
      radius: { value: 0 },
      distanceFalloff: { value: 0 },
      outputExponent: { value: 1 }
    });

    this._fullScreenTriangle = createFullScreenTriangleMesh(this._ambientOcclusionMaterial);

    this.parameters = parameters;
  }

  get parameters(): SsaoParameters {
    return { ...this._parameters };
  }

  set parameters(parameters: SsaoParameters) {
    this._parameters = { ...parameters };
    const { sampleSize, denoiseSampleSize } = parameters;

    if (sampleSize > 0 && this._ambientOcclusionMaterial.defines.SAMPLE_COUNT !== sampleSize) {
      this._ambientOcclusionMaterial.defines.SAMPLE_COUNT = sampleSize;
      this._ambientOcclusionMaterial.uniforms.samples.value = createHemisphereSamples(sampleSize);
      this._ambientOcclusionMaterial.needsUpdate = true;
    }

    if (denoiseSampleSize > 0 && this._denoiseMaterial.defines.DENOISE_SAMPLE_COUNT !== denoiseSampleSize) {
      this._denoiseMaterial.defines.DENOISE_SAMPLE_COUNT = denoiseSampleSize;
      this._denoiseMaterial.uniforms.poissonDisk.value = createDenoiseSamples(denoiseSampleSize, 11);
      this._denoiseMaterial.needsUpdate = true;
    }

    const halfResolution = this.usesHalfResolution;
    for (const material of [this._ambientOcclusionMaterial, this._denoiseMaterial]) {
      if ((material.defines.HALF_RES === true) !== halfResolution) {
        if (halfResolution) {
          material.defines.HALF_RES = true;
        } else {
          delete material.defines.HALF_RES;
        }
        material.needsUpdate = true;
      }
    }

    this.updateTargetSizes();
  }

  get enabled(): boolean {
    return this._parameters.sampleSize > 0;
  }

  /**
   * Whether ambient occlusion is computed at half resolution. False when requested, but rendering to float
   * textures isn't supported.
   */
  get usesHalfResolution(): boolean {
    return this._parameters.halfResolution && this._halfResolutionSupported;
  }

  /**
   * Number of denoise iterations that will be run.
   */
  get denoiseIterations(): number {
    const { denoiseIterations, denoiseSampleSize, denoiseRadius } = this._parameters;
    return denoiseSampleSize > 0 && denoiseRadius > 0 ? Math.max(0, Math.floor(denoiseIterations)) : 0;
  }

  /**
   * Intermediate render targets, for testing and debugging.
   */
  get renderTargets(): {
    depthDownsample: WebGLRenderTarget;
    ambientOcclusion: readonly [WebGLRenderTarget, WebGLRenderTarget];
  } {
    return { depthDownsample: this._depthDownsampleTarget, ambientOcclusion: this._ambientOcclusionTargets };
  }

  /**
   * Materials of the sub passes, for testing and debugging.
   */
  get materials(): {
    depthDownsample: RawShaderMaterial;
    ambientOcclusion: RawShaderMaterial;
    denoise: RawShaderMaterial;
    upsample: RawShaderMaterial;
  } {
    return {
      depthDownsample: this._depthDownsampleMaterial,
      ambientOcclusion: this._ambientOcclusionMaterial,
      denoise: this._denoiseMaterial,
      upsample: this._upsampleMaterial
    };
  }

  /**
   * Sets the full render size (the size of the output render target), in pixels.
   */
  public setSize(width: number, height: number): void {
    this._renderSize.set(Math.max(1, Math.floor(width)), Math.max(1, Math.floor(height)));
    this.updateTargetSizes();
  }

  public render(renderer: WebGLRenderer, camera: Camera): void {
    if (!this.enabled) {
      return;
    }

    if (!this._checkedFloatRenderTargetSupport) {
      // Half resolution depth is stored in a float texture, which requires EXT_color_buffer_float to render to.
      this._checkedFloatRenderTargetSupport = true;
      if (!renderer.extensions.has('EXT_color_buffer_float')) {
        this._halfResolutionSupported = false;
        this.parameters = this._parameters;
      }
    }

    const outputTarget = renderer.getRenderTarget();
    const halfResolution = this.usesHalfResolution;
    const denoiseIterations = this.denoiseIterations;
    const { intensity, distanceFalloff, denoiseRadius } = this._parameters;
    const resolutionScale = halfResolution ? 0.5 : 1;
    // Radius in pixels at full resolution
    const radius = (this._parameters.screenSpaceRadius * this._renderSize.y) / AMBIENT_OCCLUSION_REFERENCE_HEIGHT;
    const aoDepthTexture = halfResolution ? this._depthDownsampleTarget.texture : this._depthTexture;

    for (const material of [
      this._depthDownsampleMaterial,
      this._ambientOcclusionMaterial,
      this._denoiseMaterial,
      this._upsampleMaterial
    ]) {
      material.uniforms.cameraProjectionMatrix.value.copy(camera.projectionMatrix);
      material.uniforms.cameraInverseProjectionMatrix.value.copy(camera.projectionMatrixInverse);
    }

    if (halfResolution) {
      this.renderFullScreen(renderer, this._depthDownsampleMaterial, this._depthDownsampleTarget);
    }

    const [first, second] = this._ambientOcclusionTargets;
    let readTarget = second;
    let writeTarget = first;

    const aoUniforms = this._ambientOcclusionMaterial.uniforms;
    aoUniforms.tDepth.value = aoDepthTexture;
    aoUniforms.fullResolution.value.copy(this._renderSize);
    aoUniforms.radius.value = radius * resolutionScale;
    aoUniforms.distanceFalloff.value = distanceFalloff;
    const aoIsLastStep = !halfResolution && denoiseIterations === 0;
    aoUniforms.outputExponent.value = aoIsLastStep ? intensity : 1;
    this.renderFullScreen(renderer, this._ambientOcclusionMaterial, aoIsLastStep ? outputTarget : writeTarget);

    const denoiseUniforms = this._denoiseMaterial.uniforms;
    denoiseUniforms.tDepth.value = aoDepthTexture;
    denoiseUniforms.fullResolution.value.copy(this._renderSize);
    denoiseUniforms.denoiseRadius.value = denoiseRadius * resolutionScale;
    denoiseUniforms.radius.value = radius * resolutionScale;
    denoiseUniforms.distanceFalloff.value = distanceFalloff;
    for (let i = 0; i < denoiseIterations; i++) {
      [readTarget, writeTarget] = [writeTarget, readTarget];
      const isLastStep = !halfResolution && i === denoiseIterations - 1;
      denoiseUniforms.tAmbientOcclusion.value = readTarget.texture;
      denoiseUniforms.iteration.value = i;
      denoiseUniforms.outputExponent.value = isLastStep ? intensity : 1;
      this.renderFullScreen(renderer, this._denoiseMaterial, isLastStep ? outputTarget : writeTarget);
    }

    if (halfResolution) {
      const upsampleUniforms = this._upsampleMaterial.uniforms;
      upsampleUniforms.tAmbientOcclusion.value = writeTarget.texture;
      upsampleUniforms.radius.value = radius;
      upsampleUniforms.distanceFalloff.value = distanceFalloff;
      upsampleUniforms.outputExponent.value = intensity;
      this.renderFullScreen(renderer, this._upsampleMaterial, outputTarget);
    }

    renderer.setRenderTarget(outputTarget);
  }

  public dispose(): void {
    this._depthDownsampleTarget.dispose();
    this._ambientOcclusionTargets.forEach(target => target.dispose());
    this._depthDownsampleMaterial.dispose();
    this._ambientOcclusionMaterial.dispose();
    this._denoiseMaterial.dispose();
    this._upsampleMaterial.dispose();
    this._fullScreenTriangle.geometry.dispose();
  }

  private renderFullScreen(
    renderer: WebGLRenderer,
    material: RawShaderMaterial,
    target: WebGLRenderTarget | null
  ): void {
    this._fullScreenTriangle.material = material;
    renderer.setRenderTarget(target);
    renderer.render(this._fullScreenTriangle, unitOrthographicCamera);
  }

  private updateTargetSizes(): void {
    const { x: width, y: height } = this._renderSize;
    const enabled = this.enabled;
    const halfResolution = this.usesHalfResolution;
    const aoWidth = halfResolution ? Math.max(1, Math.floor(width / 2)) : width;
    const aoHeight = halfResolution ? Math.max(1, Math.floor(height / 2)) : height;

    // Keep unused targets minimal to avoid holding on to GPU memory.
    setTargetSize(
      this._depthDownsampleTarget,
      enabled && halfResolution ? aoWidth : 1,
      enabled && halfResolution ? aoHeight : 1
    );
    const needsPingPongTargets = enabled && (halfResolution || this.denoiseIterations > 0);
    for (const target of this._ambientOcclusionTargets) {
      setTargetSize(target, needsPingPongTargets ? aoWidth : 1, needsPingPongTargets ? aoHeight : 1);
    }
  }
}

/**
 * Directions in a hemisphere around +z, spread with a golden angle spiral (as in N8AO).
 */
export function createHemisphereSamples(count: number): Vector3[] {
  const samples: Vector3[] = [];
  for (let k = 0; k < count; k++) {
    const theta = 2.399963 * k;
    const r = Math.sqrt(k + 0.5) / Math.sqrt(count);
    const x = r * Math.cos(theta);
    const y = r * Math.sin(theta);
    const z = Math.sqrt(1 - (x * x + y * y));
    samples.push(new Vector3(x, y, z));
  }
  return samples;
}

/**
 * Points in the unit disk along a spiral with `rings` turns (as in N8AO).
 */
export function createDenoiseSamples(count: number, rings: number): Vector2[] {
  const angleStep = (2 * Math.PI * rings) / count;
  const radiusStep = 1 / count;
  const samples: Vector2[] = [];
  let radius = radiusStep;
  let angle = 0;
  for (let i = 0; i < count; i++) {
    samples.push(new Vector2(Math.cos(angle), Math.sin(angle)).multiplyScalar(Math.pow(radius, 0.75)));
    radius += radiusStep;
    angle += angleStep;
  }
  return samples;
}

function createMaterial(shader: ShaderPair, uniforms: RawShaderMaterial['uniforms']): RawShaderMaterial {
  return new RawShaderMaterial({
    vertexShader: shader.vertex,
    fragmentShader: shader.fragment,
    uniforms: {
      ...uniforms,
      cameraProjectionMatrix: { value: new Matrix4() },
      cameraInverseProjectionMatrix: { value: new Matrix4() }
    },
    defines: {},
    glslVersion: GLSL3,
    depthTest: false,
    depthWrite: false
  });
}

function createIntermediateTarget(
  type: typeof FloatType | typeof UnsignedByteType,
  filter: typeof NearestFilter | typeof LinearFilter
): WebGLRenderTarget {
  return new WebGLRenderTarget(1, 1, {
    format: RGBAFormat,
    type,
    minFilter: filter,
    magFilter: filter,
    depthBuffer: false,
    stencilBuffer: false,
    generateMipmaps: false
  });
}

function setTargetSize(target: WebGLRenderTarget, width: number, height: number): void {
  if (target.width !== width || target.height !== height) {
    target.setSize(width, height);
  }
}
