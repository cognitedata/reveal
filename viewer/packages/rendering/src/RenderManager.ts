/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import { RenderPipelineProvider } from './RenderPipelineProvider';

export class RenderManager {
  private readonly _renderer: THREE.WebGLRenderer;

  constructor(renderer: THREE.WebGLRenderer) {
    this._renderer = renderer;
  }

  public async render(renderPipeline: RenderPipelineProvider, camera: THREE.Camera): Promise<void> {
    for await (const renderPass of renderPipeline.pipeline()) {
      await renderPass.render(this._renderer, camera);
    }
    return;
  }
}
