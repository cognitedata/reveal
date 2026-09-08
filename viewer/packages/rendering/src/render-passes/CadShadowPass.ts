/*!
 * Copyright 2026 Cognite AS
 */

import type { Camera, Texture, WebGLRenderer } from 'three';
import {
  Color,
  GLSL3,
  HalfFloatType,
  LinearFilter,
  Matrix4,
  Mesh,
  NoColorSpace,
  RGBAFormat,
  RawShaderMaterial,
  Scene,
  Vector4,
  WebGLRenderTarget
} from 'three';
import { cadShadowShaders } from '../rendering/shaders';
import { createFullScreenTriangleMesh } from '../utilities/renderUtilities';
import type { CadShadowMap } from '../render-pipeline-providers/types';

const SHADOW_STRENGTH = 0.72;

/**
 * Resolves the CAD shadow map into a screen-space lit factor.
 *
 * Every pixel is compared against light-space depth, so geometry receives shadows
 * from casters that are not visible to the view camera.
 */
export class CadShadowPass {
  private readonly _renderTarget: WebGLRenderTarget;
  private readonly _material: RawShaderMaterial;
  private readonly _mesh: Mesh;
  private readonly _scene: Scene;
  private readonly _shadowMap: CadShadowMap;
  private readonly _clearColor = new Color();
  private _groundY = 0;

  constructor(cameraDepthTexture: Texture | null, shadowMap: CadShadowMap) {
    this._shadowMap = shadowMap;

    this._renderTarget = new WebGLRenderTarget(1, 1, {
      depthBuffer: false,
      stencilBuffer: false,
      type: HalfFloatType,
      format: RGBAFormat,
      magFilter: LinearFilter,
      minFilter: LinearFilter
    });
    this._renderTarget.texture.colorSpace = NoColorSpace;

    this._material = new RawShaderMaterial({
      vertexShader: cadShadowShaders.vertex,
      fragmentShader: cadShadowShaders.fragment,
      uniforms: {
        tDepth: { value: cameraDepthTexture },
        tCadShadowMap: { value: shadowMap.depthTexture },
        inverseProjectionMatrix: { value: new Matrix4() },
        cadCameraMatrixWorld: { value: new Matrix4() },
        cadShadowMatrix: { value: new Matrix4() },
        cadShadowPlane: { value: new Vector4(0, 1, 0, 0) },
        cadShadowTexelWorld: { value: 1 },
        cadShadowDepthRange: { value: 1 },
        cadShadowStrength: { value: SHADOW_STRENGTH },
        cadShadowEnabled: { value: 0 }
      },
      glslVersion: GLSL3,
      depthTest: false,
      depthWrite: false
    });

    this._mesh = createFullScreenTriangleMesh(this._material);
    this._scene = new Scene();
    this._scene.add(this._mesh);
  }

  public get texture(): Texture {
    return this._renderTarget.texture;
  }

  public setShadowGroundY(y: number): void {
    this._groundY = y;
  }

  public setSize(width: number, height: number): void {
    this._renderTarget.setSize(width, height);
  }

  public render(renderer: WebGLRenderer, camera: Camera): void {
    const previousTarget = renderer.getRenderTarget();
    const previousAlpha = renderer.getClearAlpha();
    renderer.getClearColor(this._clearColor);

    const uniforms = this._material.uniforms;
    uniforms.inverseProjectionMatrix.value.copy(camera.projectionMatrixInverse);
    uniforms.cadCameraMatrixWorld.value.copy(camera.matrixWorld);
    uniforms.cadShadowMatrix.value.copy(this._shadowMap.matrix);
    uniforms.cadShadowTexelWorld.value = this._shadowMap.texelWorldSize;
    uniforms.cadShadowDepthRange.value = this._shadowMap.depthRange;
    uniforms.cadShadowEnabled.value = this._shadowMap.enabled ? 1 : 0;
    // World-space ground plane: normal (0, 1, 0), so plane constant is -groundY.
    (uniforms.cadShadowPlane.value as Vector4).set(0, 1, 0, -this._groundY);

    renderer.setClearColor('#FFFFFF', 1.0);
    renderer.setRenderTarget(this._renderTarget);
    renderer.clear();
    renderer.render(this._scene, camera);

    renderer.setClearColor(this._clearColor, previousAlpha);
    renderer.setRenderTarget(previousTarget);
  }

  public dispose(): void {
    this._renderTarget.dispose();
    this._mesh.geometry.dispose();
    this._material.dispose();
  }
}
