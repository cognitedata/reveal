/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import { ssaoShaders } from '../rendering/shaders';
import { SsaoParameters } from '../rendering/types';
import { RenderPass } from '../RenderPass';
import { createFullScreenTriangleMesh, unitOrthographicCamera } from '../utilities/renderUtilities';

export class SSAOPass implements RenderPass {
  private readonly _fullScreenTriangle: THREE.Mesh;
  private readonly _ssaoShaderMaterial: THREE.RawShaderMaterial;

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

  constructor(depthTexture: THREE.Texture, ssaoParameters: SsaoParameters) {
    const { sampleSize, depthCheckBias, sampleRadius } = ssaoParameters;

    const uniforms = {
      tDepth: { value: depthTexture },
      projMatrix: { value: new THREE.Matrix4() },
      inverseProjectionMatrix: { value: new THREE.Matrix4() },
      sampleRadius: { value: sampleRadius },
      bias: { value: depthCheckBias },
      kernel: { value: this.createKernel(sampleSize) }
    };

    this._ssaoShaderMaterial = new THREE.RawShaderMaterial({
      vertexShader: ssaoShaders.vertex,
      fragmentShader: ssaoShaders.fragment,
      uniforms,
      defines: {
        MAX_KERNEL_SIZE: sampleSize
      },
      glslVersion: THREE.GLSL3,
      depthTest: false,
      depthWrite: false
    });

    this._fullScreenTriangle = createFullScreenTriangleMesh(this._ssaoShaderMaterial);
    this._fullScreenTriangle.visible = sampleSize > 0;
  }

  public render(renderer: THREE.WebGLRenderer, camera: THREE.Camera): void {
    this._ssaoShaderMaterial.uniforms.inverseProjectionMatrix.value = camera.projectionMatrixInverse;
    this._ssaoShaderMaterial.uniforms.projMatrix.value = camera.projectionMatrix;

    renderer.render(this._fullScreenTriangle, unitOrthographicCamera);
  }

  private createKernel(kernelSize: number): THREE.Vector3[] {
    const result: THREE.Vector3[] = [];
    for (let i = 0; i < kernelSize; i++) {
      const sample = new THREE.Vector3();
      while (sample.length() < 1.0) {
        // Ensure some distance in samples
        sample.x = Math.random() * 2 - 1;
        sample.y = Math.random() * 2 - 1;
        sample.z = Math.random();
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
