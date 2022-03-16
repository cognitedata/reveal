/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import { ssaoShaders } from '../rendering/shaders';
import { RenderPass } from '../RenderPass';
import { createFullScreenTriangleMesh, unitOrthographicCamera } from '../utilities/renderUtilities';

export class SSAOPass implements RenderPass {
  private readonly _renderTarget: THREE.WebGLRenderTarget;
  private readonly _fullScreenTriangle: THREE.Mesh;
  private readonly _ssaoShaderMaterial: THREE.RawShaderMaterial;

  constructor(depthTexture?: THREE.Texture) {
    const sampleSize = 64;

    const uniforms = {
      tDepth: { value: depthTexture },
      projMatrix: { value: new THREE.Matrix4() },
      inverseProjectionMatrix: { value: new THREE.Matrix4() },
      sampleRadius: { value: 1.0 },
      bias: { value: 0.0125 },
      kernel: { value: this.createKernel(sampleSize) }
    };

    // uniform vec2 resolution;

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
  }

  public getOutputRenderTarget(): THREE.WebGLRenderTarget | null {
    return this._renderTarget;
  }

  public render(renderer: THREE.WebGLRenderer, camera: THREE.Camera): Promise<THREE.WebGLRenderTarget> {
    this._ssaoShaderMaterial.uniforms.inverseProjectionMatrix.value = camera.projectionMatrixInverse;
    this._ssaoShaderMaterial.uniforms.projMatrix.value = camera.projectionMatrix;

    renderer.render(this._fullScreenTriangle, unitOrthographicCamera);
    return;
  }

  private createKernel(kernelSize: number) {
    const result = [];
    for (let i = 0; i < kernelSize; i++) {
      const sample = new THREE.Vector3();
      while (sample.length() < 0.5) {
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
