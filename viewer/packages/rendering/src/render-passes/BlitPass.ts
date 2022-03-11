/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import { RenderPass } from '../RenderPass';
import { createFullscreenTextureObject, unitOrthographicCamera } from '../utilities/renderUtilities';

export class BlitPass implements RenderPass {
  private readonly _renderTarget: THREE.WebGLRenderTarget;
  private readonly _fullScreenTriangle: THREE.Mesh;

  constructor(texture: THREE.Texture, depthTexture?: THREE.Texture, transparent?: boolean) {
    this._fullScreenTriangle = createFullscreenTextureObject(texture, depthTexture, transparent);
  }

  public getOutputRenderTarget(): THREE.WebGLRenderTarget | null {
    return this._renderTarget;
  }

  public render(renderer: THREE.WebGLRenderer, _: THREE.Camera): Promise<THREE.WebGLRenderTarget> {
    renderer.render(this._fullScreenTriangle, unitOrthographicCamera);
    return;
  }
}
