/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import { PipelineExecutor } from '../PipelineExecutor';
import { BlitPass } from '../render-passes/BlitPass';
import { RenderPipelineProvider } from '../RenderPipelineProvider';

export class StepPipelineExecutor implements PipelineExecutor {
  private readonly _renderer: THREE.WebGLRenderer;
  private _numSteps: number | undefined;

  set numberOfSteps(steps: number) {
    this._numSteps = steps;
  }

  constructor(renderer: THREE.WebGLRenderer) {
    this._renderer = renderer;
    renderer.info.autoReset = false;
  }

  public async render(renderPipeline: RenderPipelineProvider, camera: THREE.Camera): Promise<void> {
    this._renderer.info.reset();
    renderPipeline.pipeline(this._renderer);
    let count = 0;
    for await (const renderPass of renderPipeline.pipeline(this._renderer)) {
      count++;
      await renderPass.render(this._renderer, camera);
      const currentRenderTarget = this._renderer.getRenderTarget();
      if (count === this._numSteps && currentRenderTarget !== null) {
        this._renderer.setRenderTarget(null);
        await new BlitPass({ texture: currentRenderTarget.texture }).render(this._renderer, camera);
        return;
      }
    }
  }

  public calcNumSteps(renderPipeline: RenderPipelineProvider): number {
    let count = 0;
    for (const _ of renderPipeline.pipeline(this._renderer)) {
      count++;
    }

    return count;
  }
}
