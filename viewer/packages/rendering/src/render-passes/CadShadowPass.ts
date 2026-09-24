/*!
 * Copyright 2026 Cognite AS
 */

import type { Camera, Texture, WebGLRenderer, Mesh } from 'three';
import {
  Color,
  GLSL3,
  LinearFilter,
  Matrix4,
  NoColorSpace,
  RawShaderMaterial,
  RedFormat,
  Scene,
  UnsignedByteType,
  WebGLRenderTarget
} from 'three';
import { CAD_LIGHT_WORLD, CAD_SHADOW_STRENGTH } from '../rendering/cadLighting';
import { cadShadowShaders } from '../rendering/shaders';
import { createFullScreenTriangleMesh } from '../utilities/renderUtilities';
import type { CadShadowMap } from '../render-pipeline-providers/types';

const CAD_TERMINATOR_FADE = 0.35;

export class CadShadowPass {
  private readonly _renderTarget: WebGLRenderTarget;
  private readonly _material: RawShaderMaterial;
  private readonly _mesh: Mesh;
  private readonly _scene: Scene;
  private readonly _shadowMap: CadShadowMap;
  private readonly _clearColor = new Color();

  constructor(
    cameraDepthTexture: Texture | null,
    shadowMap: CadShadowMap,
    terminatorFade: number = CAD_TERMINATOR_FADE
  ) {
    this._shadowMap = shadowMap;

    this._renderTarget = new WebGLRenderTarget(1, 1, {
      depthBuffer: false,
      stencilBuffer: false,
      type: UnsignedByteType,
      format: RedFormat,
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
        cadShadowLightDirection: { value: CAD_LIGHT_WORLD },
        cadShadowTexelWorld: { value: 1 },
        cadShadowDepthRange: { value: 1 },
        cadShadowStrength: { value: CAD_SHADOW_STRENGTH },
        cadShadowTerminatorFade: { value: terminatorFade }
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
