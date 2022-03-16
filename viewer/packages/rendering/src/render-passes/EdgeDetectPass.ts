/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import { edgeDetectShaders } from '../rendering/shaders';
import { RenderPass } from '../RenderPass';
import { createFullScreenTriangleMesh, unitOrthographicCamera } from '../utilities/renderUtilities';

export class EdgeDetectPass implements RenderPass {
  private readonly _renderTarget: THREE.WebGLRenderTarget;
  private readonly _fullScreenTriangle: THREE.Mesh;

  constructor(texture: THREE.Texture) {
    const edgeDetectShaderMaterial = new THREE.RawShaderMaterial({
      vertexShader: edgeDetectShaders.vertex,
      fragmentShader: edgeDetectShaders.fragment,
      uniforms: {
        tDiffuse: { value: texture }
      },
      glslVersion: THREE.GLSL3,
      depthTest: false,
      depthWrite: false,
      blending: THREE.CustomBlending,
      blendDst: THREE.SrcAlphaFactor,
      blendSrc: THREE.ZeroFactor,
      blendDstAlpha: THREE.OneFactor,
      blendSrcAlpha: THREE.ZeroFactor
    });

    this._fullScreenTriangle = createFullScreenTriangleMesh(edgeDetectShaderMaterial);
  }

  public getOutputRenderTarget(): THREE.WebGLRenderTarget | null {
    return this._renderTarget;
  }

  public render(renderer: THREE.WebGLRenderer, _: THREE.Camera): Promise<THREE.WebGLRenderTarget> {
    renderer.render(this._fullScreenTriangle, unitOrthographicCamera);
    return;
  }
}
