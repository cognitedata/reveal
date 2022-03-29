/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import { PipelineExecutor } from '../PipelineExecutor';
import { RenderPipelineProvider } from '../RenderPipelineProvider';

export class BasicPipelineExecutor implements PipelineExecutor {
  private readonly _renderer: THREE.WebGLRenderer;

  constructor(renderer: THREE.WebGLRenderer) {
    this._renderer = renderer;
    renderer.info.autoReset = false;
  }

  public async render(renderPipeline: RenderPipelineProvider, camera: THREE.Camera): Promise<void> {
    this._renderer.info.reset();
    for await (const renderPass of renderPipeline.pipeline(this._renderer)) {
      await renderPass.render(this._renderer, camera);
    }
  }
}
