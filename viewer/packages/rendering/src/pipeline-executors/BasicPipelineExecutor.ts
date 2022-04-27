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

  public render(renderPipeline: RenderPipelineProvider, camera: THREE.Camera): void {
    this._renderer.info.reset();
    for (const renderPass of renderPipeline.pipeline(this._renderer)) {
      renderPass.render(this._renderer, camera);
    }
  }
}
