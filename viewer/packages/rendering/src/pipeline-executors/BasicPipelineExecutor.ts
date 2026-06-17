/*!
 * Copyright 2022 Cognite AS
 */

import type { PerspectiveCamera } from 'three';

import type { RenderPipelineExecutor } from '../RenderPipelineExecutor';
import type { RenderPipelineProvider } from '../RenderPipelineProvider';
import type { RevealRenderer } from '../rendering/RevealRenderer';

export class BasicPipelineExecutor implements RenderPipelineExecutor {
  private readonly _renderer: RevealRenderer;

  constructor(renderer: RevealRenderer) {
    this._renderer = renderer;

    renderer.info.autoReset = false;
  }

  public render(renderPipeline: RenderPipelineProvider, camera: PerspectiveCamera): void {
    this._renderer.info.reset();
    for (const renderPass of renderPipeline.pipeline(this._renderer)) {
      renderPass.render(this._renderer, camera);
    }
  }

  dispose(): void {}
}
