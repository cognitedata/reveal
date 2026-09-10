/*!
 * Copyright 2022 Cognite AS
 */

import type { Camera, Mesh, Texture, WebGLRenderer } from 'three';
import { GLSL3, Matrix4, RawShaderMaterial, Vector3 } from 'three';
import { ssaoShaders } from '../rendering/shaders';
import type { SsaoParameters } from '../rendering/types';
import type { RenderPass } from '../RenderPass';
import { createFullScreenTriangleMesh, unitOrthographicCamera } from '../utilities/renderUtilities';

import SeededRandom from 'random-seed';

export class SSAOPass implements RenderPass {
  private readonly _fullScreenTriangle: Mesh;
  private readonly _ssaoShaderMaterial: RawShaderMaterial;

  set ssaoParameters(ssaoParameters: SsaoParameters) {
    const { sampleSize, depthCheckBias, sampleRadius } = ssaoParameters;

    this._ssaoShaderMaterial.uniforms.sampleRadius.value = sampleRadius;
    this._ssaoShaderMaterial.uniforms.bias.value = depthCheckBias;

    if (sampleSize !== this._ssaoShaderMaterial.defines.MAX_KERNEL_SIZE) {
      this._ssaoShaderMaterial.defines.MAX_KERNEL_SIZE = sampleSize;
      this._ssaoShaderMaterial.uniforms.kernel.value = this.createKernel(sampleSize);
      this._ssaoShaderMaterial.needsUpdate = true;
    }

    this._fullScreenTriangle.visible = sampleSize > 0;
  }

  constructor(depthTexture: Texture | null, ssaoParameters: SsaoParameters) {
    const { sampleSize, depthCheckBias, sampleRadius } = ssaoParameters;

    const uniforms = {
      tDepth: { value: depthTexture },
      projMatrix: { value: new Matrix4() },
      inverseProjectionMatrix: { value: new Matrix4() },
      sampleRadius: { value: sampleRadius },
      bias: { value: depthCheckBias },
      kernel: { value: this.createKernel(sampleSize) }
    };

    this._ssaoShaderMaterial = new RawShaderMaterial({
      vertexShader: ssaoShaders.vertex,
      fragmentShader: ssaoShaders.fragment,
      uniforms,
      defines: {
        MAX_KERNEL_SIZE: sampleSize
      },
      glslVersion: GLSL3,
      depthTest: false,
      depthWrite: false
    });

    this._fullScreenTriangle = createFullScreenTriangleMesh(this._ssaoShaderMaterial);
    this._fullScreenTriangle.visible = sampleSize > 0;
  }

  public render(renderer: WebGLRenderer, camera: Camera): void {
    this._ssaoShaderMaterial.uniforms.inverseProjectionMatrix.value = camera.projectionMatrixInverse;
    this._ssaoShaderMaterial.uniforms.projMatrix.value = camera.projectionMatrix;

    renderer.render(this._fullScreenTriangle, unitOrthographicCamera);
  }

  private createKernel(kernelSize: number): Vector3[] {
    const random = SeededRandom.create('some_seed');
    const result: Vector3[] = [];
    for (let i = 0; i < kernelSize; i++) {
      const sample = new Vector3(1, 1, 1);
      while (sample.length() > 1.0) {
        // Ensure some distance in samples
        sample.x = random.random() * 2 - 1;
        sample.y = random.random() * 2 - 1;
        sample.z = random.random();
      }
      sample.normalize();
      let scale = i / kernelSize;
      scale = lerp(0.1, 1, scale * scale);
      sample.multiplyScalar(scale);
      result.push(sample);
    }
    return result;

    function lerp(value1: number, value2: number, amount: number) {
      amount = amount < 0 ? 0 : amount;
      amount = amount > 1 ? 1 : amount;
      return value1 + (value2 - value1) * amount;
    }
  }
}
