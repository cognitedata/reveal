/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import { WebGLRenderTarget } from 'three';
import { RenderPass } from '../RenderPass';

export class GeometryPass implements RenderPass {
  private readonly _geometryScene: THREE.Scene;
  private readonly _renderTarget: THREE.WebGLRenderTarget;

  constructor(scene: THREE.Scene, renderTarget: WebGLRenderTarget = null) {
    this._geometryScene = scene;
    this._renderTarget = renderTarget;
  }

  public getOutputRenderTarget(): THREE.WebGLRenderTarget | null {
    return this._renderTarget;
  }

  public render(renderer: THREE.WebGLRenderer, camera: THREE.Camera): Promise<THREE.WebGLRenderTarget> {
    renderer.setRenderTarget(this._renderTarget);
    renderer.render(this._geometryScene, camera);
    return;
  }
}
