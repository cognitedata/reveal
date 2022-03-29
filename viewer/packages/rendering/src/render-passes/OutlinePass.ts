/*!
 * Copyright 2022 Cognite AS
 */

import { NodeOutlineColor } from '@reveal/cad-styling';
import * as THREE from 'three';
import { outlineShaders } from '../rendering/shaders';
import { RenderPass } from '../RenderPass';
import { createFullScreenTriangleMesh, unitOrthographicCamera } from '../utilities/renderUtilities';
import { CogniteColors, RevealColors } from '../utilities/types';

export class OutlinePass implements RenderPass {
  private readonly _renderTarget: THREE.WebGLRenderTarget;
  private readonly _fullScreenTriangle: THREE.Mesh;

  constructor(texture: THREE.Texture) {
    const outlineShaderMaterial = new THREE.RawShaderMaterial({
      vertexShader: outlineShaders.vertex,
      fragmentShader: outlineShaders.fragment,
      uniforms: {
        tDiffuse: { value: texture },
        tOutlineColors: { value: this.createOutlineColorTexture() }
      },
      glslVersion: THREE.GLSL3,
      depthTest: false,
      depthWrite: false,
      blending: THREE.CustomBlending,
      blendDst: THREE.OneMinusSrcAlphaFactor,
      blendSrc: THREE.SrcAlphaFactor,
      blendDstAlpha: THREE.OneFactor,
      blendSrcAlpha: THREE.ZeroFactor
    });

    this._fullScreenTriangle = createFullScreenTriangleMesh(outlineShaderMaterial);
  }

  public getOutputRenderTarget(): THREE.WebGLRenderTarget | null {
    return this._renderTarget;
  }

  public render(renderer: THREE.WebGLRenderer, _: THREE.Camera): Promise<THREE.WebGLRenderTarget> {
    renderer.render(this._fullScreenTriangle, unitOrthographicCamera);
    return;
  }

  private createOutlineColorTexture(): THREE.DataTexture {
    const outlineColorBuffer = new Uint8Array(8 * 4);
    const outlineColorTexture = new THREE.DataTexture(outlineColorBuffer, 8, 1);
    this.setOutlineColor(outlineColorTexture.image.data, NodeOutlineColor.White, CogniteColors.White);
    this.setOutlineColor(outlineColorTexture.image.data, NodeOutlineColor.Black, CogniteColors.Black);
    this.setOutlineColor(outlineColorTexture.image.data, NodeOutlineColor.Cyan, CogniteColors.Cyan);
    this.setOutlineColor(outlineColorTexture.image.data, NodeOutlineColor.Blue, CogniteColors.Blue);
    this.setOutlineColor(outlineColorTexture.image.data, NodeOutlineColor.Green, RevealColors.Green);
    this.setOutlineColor(outlineColorTexture.image.data, NodeOutlineColor.Red, RevealColors.Red);
    this.setOutlineColor(outlineColorTexture.image.data, NodeOutlineColor.Orange, CogniteColors.Orange);
    outlineColorTexture.needsUpdate = true;
    return outlineColorTexture;
  }

  private setOutlineColor(outlineTextureData: Uint8ClampedArray, colorIndex: number, color: THREE.Color) {
    outlineTextureData[4 * colorIndex + 0] = Math.floor(255 * color.r);
    outlineTextureData[4 * colorIndex + 1] = Math.floor(255 * color.g);
    outlineTextureData[4 * colorIndex + 2] = Math.floor(255 * color.b);
    outlineTextureData[4 * colorIndex + 3] = 255;
  }
}
