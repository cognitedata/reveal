/*!
 * Copyright 2025 Cognite AS
 */

import * as THREE from 'three';
import { taaShaders } from '../rendering/shaders';
import { TaaParameters } from '../rendering/types';
import { RenderPass } from '../RenderPass';
import { createFullScreenTriangleMesh, unitOrthographicCamera } from '../utilities/renderUtilities';

export class TAAPass implements RenderPass {
  private readonly _fullScreenTriangle: THREE.Mesh;
  private readonly _taaShaderMaterial: THREE.RawShaderMaterial;
  private _historyRenderTarget: THREE.WebGLRenderTarget;
  private _currentRenderTarget: THREE.WebGLRenderTarget;
  private _frameIndex: number = 0;
  private _previousViewProjMatrix: THREE.Matrix4 = new THREE.Matrix4();
  private _previousCameraPosition: THREE.Vector3 = new THREE.Vector3();
  private _enabled: boolean = true;

  // Halton sequence for jittering (provides better distribution than random)
  private readonly _haltonSequence: THREE.Vector2[] = this.generateHaltonSequence(16);

  set taaParameters(taaParameters: TaaParameters) {
    const { enabled, blendFactor, velocityThreshold } = taaParameters;

    this._enabled = enabled;
    this._taaShaderMaterial.uniforms.blendFactor.value = blendFactor;
    this._taaShaderMaterial.uniforms.velocityThreshold.value = velocityThreshold;
    this._fullScreenTriangle.visible = enabled;
  }

  constructor(
    currentColorTexture: THREE.Texture,
    currentDepthTexture: THREE.Texture,
    taaParameters: TaaParameters,
    width: number,
    height: number
  ) {
    const { enabled, blendFactor, velocityThreshold } = taaParameters;
    this._enabled = enabled;

    // Create render targets for history
    this._historyRenderTarget = new THREE.WebGLRenderTarget(width, height, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
      depthBuffer: true,
      depthTexture: new THREE.DepthTexture(width, height)
    });

    this._currentRenderTarget = new THREE.WebGLRenderTarget(width, height, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
      depthBuffer: true,
      depthTexture: new THREE.DepthTexture(width, height)
    });

    const uniforms = {
      tCurrent: { value: currentColorTexture },
      tCurrentDepth: { value: currentDepthTexture },
      tHistory: { value: this._historyRenderTarget.texture },
      tHistoryDepth: { value: this._historyRenderTarget.depthTexture },
      prevViewProjMatrix: { value: new THREE.Matrix4() },
      invViewProjMatrix: { value: new THREE.Matrix4() },
      jitterOffset: { value: new THREE.Vector2(0, 0) },
      blendFactor: { value: blendFactor },
      velocityThreshold: { value: velocityThreshold }
    };

    this._taaShaderMaterial = new THREE.RawShaderMaterial({
      vertexShader: taaShaders.vertex,
      fragmentShader: taaShaders.fragment,
      uniforms,
      glslVersion: THREE.GLSL3,
      depthTest: false,
      depthWrite: false
    });

    this._fullScreenTriangle = createFullScreenTriangleMesh(this._taaShaderMaterial);
    this._fullScreenTriangle.visible = enabled;
  }

  /**
   * Generate Halton sequence for jittering
   * Provides better temporal sampling distribution than random jitter
   */
  private generateHaltonSequence(count: number): THREE.Vector2[] {
    const sequence: THREE.Vector2[] = [];

    for (let i = 0; i < count; i++) {
      const x = this.haltonNumber(i + 1, 2);
      const y = this.haltonNumber(i + 1, 3);
      sequence.push(new THREE.Vector2(x - 0.5, y - 0.5));
    }

    return sequence;
  }

  private haltonNumber(index: number, base: number): number {
    let result = 0;
    let f = 1 / base;
    let i = index;

    while (i > 0) {
      result += f * (i % base);
      i = Math.floor(i / base);
      f /= base;
    }

    return result;
  }

  /**
   * Get current frame's jitter offset
   */
  public getJitterOffset(): THREE.Vector2 {
    if (!this._enabled) {
      return new THREE.Vector2(0, 0);
    }

    const jitter = this._haltonSequence[this._frameIndex % this._haltonSequence.length];
    return jitter.clone();
  }

  /**
   * Apply jitter to camera projection matrix for sub-pixel sampling
   */
  public applyCameraJitter(camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer): void {
    if (!this._enabled) {
      return;
    }

    const jitter = this.getJitterOffset();
    const size = renderer.getSize(new THREE.Vector2());

    // Convert to NDC space (-1 to 1)
    const jitterX = (jitter.x * 2.0) / size.x;
    const jitterY = (jitter.y * 2.0) / size.y;

    // Apply jitter to projection matrix
    const projectionMatrix = camera.projectionMatrix.clone();
    projectionMatrix.elements[8] += jitterX;
    projectionMatrix.elements[9] += jitterY;

    camera.projectionMatrix.copy(projectionMatrix);
  }

  /**
   * Check if camera has moved significantly (for adaptive blending)
   */
  private hasCameraMoved(camera: THREE.Camera): boolean {
    const currentPosition = camera.position;
    const positionDelta = currentPosition.distanceTo(this._previousCameraPosition);

    return positionDelta > 0.001;
  }

  public render(renderer: THREE.WebGLRenderer, camera: THREE.Camera): void {
    if (!this._enabled || !(camera instanceof THREE.PerspectiveCamera)) {
      return;
    }

    // Update uniforms
    const viewProjMatrix = new THREE.Matrix4();
    viewProjMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);

    const invViewProjMatrix = viewProjMatrix.clone().invert();

    this._taaShaderMaterial.uniforms.prevViewProjMatrix.value.copy(this._previousViewProjMatrix);
    this._taaShaderMaterial.uniforms.invViewProjMatrix.value.copy(invViewProjMatrix);
    this._taaShaderMaterial.uniforms.jitterOffset.value.copy(this.getJitterOffset());

    // Render TAA
    renderer.setRenderTarget(this._currentRenderTarget);
    renderer.render(this._fullScreenTriangle, unitOrthographicCamera);

    // Swap buffers (current becomes history for next frame)
    const temp = this._historyRenderTarget;
    this._historyRenderTarget = this._currentRenderTarget;
    this._currentRenderTarget = temp;

    // Update history texture reference
    this._taaShaderMaterial.uniforms.tHistory.value = this._historyRenderTarget.texture;
    this._taaShaderMaterial.uniforms.tHistoryDepth.value = this._historyRenderTarget.depthTexture;

    // Store current frame's view-projection matrix for next frame
    this._previousViewProjMatrix.copy(viewProjMatrix);
    this._previousCameraPosition.copy(camera.position);

    // Increment frame counter
    this._frameIndex++;
  }

  public updateSize(width: number, height: number): void {
    this._historyRenderTarget.setSize(width, height);
    this._currentRenderTarget.setSize(width, height);
  }

  public getOutputTexture(): THREE.Texture {
    return this._historyRenderTarget.texture;
  }

  public reset(): void {
    // Reset history when scene changes dramatically
    this._frameIndex = 0;
    this._previousViewProjMatrix.identity();
  }

  public dispose(): void {
    this._historyRenderTarget.dispose();
    this._currentRenderTarget.dispose();
    this._taaShaderMaterial.dispose();
    this._fullScreenTriangle.geometry.dispose();
  }
}

