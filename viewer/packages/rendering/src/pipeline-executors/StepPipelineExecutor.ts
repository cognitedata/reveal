/*!
 * Copyright 2022 Cognite AS
 */

import type { Camera } from 'three';
import type { RevealRenderer } from '../rendering/RevealRenderer';
import type { RenderPipelineExecutor } from '../RenderPipelineExecutor';
import type { RenderPipelineProvider } from '../RenderPipelineProvider';
import { GpuTimer } from '../utilities/GpuTimer';

export class StepPipelineExecutor implements RenderPipelineExecutor {
  private readonly _renderer: RevealRenderer;
  private _numSteps: number | undefined;
  private readonly _gpuTimer: GpuTimer;

  set numberOfSteps(steps: number) {
    this._numSteps = steps;
  }

  get timings(): number[] {
    return this._gpuTimer.timings;
  }

  constructor(renderer: RevealRenderer) {
    this._renderer = renderer;
    renderer.info.autoReset = false;
    this._gpuTimer = new GpuTimer(renderer.getContext() as WebGL2RenderingContext);
  }

  public render(renderPipeline: RenderPipelineProvider, camera: Camera): void {
    this._renderer.info.reset();
    let count = 0;

    this._gpuTimer.begin('FULL');

    for (const renderPass of renderPipeline.pipeline(this._renderer)) {
      count++;

      if (count === this._numSteps) {
        this._renderer.setRenderTarget(null);
        renderPass.render(this._renderer, camera);
        break;
      }
      renderPass.render(this._renderer, camera);
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

  public dispose(): void {}
}
