/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import { PipelineExecutor } from '../PipelineExecutor';
import { BlitPass } from '../render-passes/BlitPass';
import { RenderPipelineProvider } from '../RenderPipelineProvider';
import { GpuTimer } from '../utilities/GpuTimer';

export class StepPipelineExecutor implements PipelineExecutor {
  private readonly _renderer: THREE.WebGLRenderer;
  private _numSteps: number | undefined;
  private readonly _gpuTimer: GpuTimer;

  set numberOfSteps(steps: number) {
    this._numSteps = steps;
  }

  get timings(): number[] {
    return this._gpuTimer.timings;
  }

  constructor(renderer: THREE.WebGLRenderer) {
    this._renderer = renderer;
    renderer.info.autoReset = false;
    this._gpuTimer = new GpuTimer(renderer.getContext() as WebGL2RenderingContext);
  }

  public async render(renderPipeline: RenderPipelineProvider, camera: THREE.Camera): Promise<void> {
    this._renderer.info.reset();
    let count = 0;

    this._gpuTimer.begin('FULL');

    for await (const renderPass of renderPipeline.pipeline(this._renderer)) {
      count++;
      await renderPass.render(this._renderer, camera);
      const currentRenderTarget = this._renderer.getRenderTarget();
      if (count === this._numSteps && currentRenderTarget !== null) {
        this._renderer.setRenderTarget(null);
        await new BlitPass({ texture: currentRenderTarget.texture, overrideAlpha: 1 }).render(this._renderer, camera);
        this._gpuTimer.end();
        return;
      }
    }

    this._gpuTimer.end();
  }

  public calcNumSteps(renderPipeline: RenderPipelineProvider): number {
    let count = 0;
    for (const _ of renderPipeline.pipeline(this._renderer)) {
      count++;
    }

    return count;
  }
}
