/*!
 * Copyright 2022 Cognite AS
 */

import type { Camera, WebGLRenderer, WebGLRenderTarget } from 'three';
import type { RenderPipelineExecutor, RenderView } from '../RenderPipelineExecutor';
import type { RenderPipelineProvider } from '../RenderPipelineProvider';
import type { SettableRenderTarget } from '../rendering/SettableRenderTarget';
import { GpuTimer } from '../utilities/GpuTimer';
import { BasicPipelineExecutor } from './BasicPipelineExecutor';

export class StepPipelineExecutor implements RenderPipelineExecutor {
  private readonly _renderer: WebGLRenderer;
  private _numSteps: number | undefined;
  private readonly _gpuTimer: GpuTimer;

  set numberOfSteps(steps: number) {
    this._numSteps = steps;
  }

  get timings(): number[] {
    return this._gpuTimer.timings;
  }

  constructor(renderer: WebGLRenderer) {
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

  public renderViews(
    renderPipeline: RenderPipelineProvider & SettableRenderTarget,
    output: WebGLRenderTarget,
    views: readonly RenderView[]
  ): void {
    new BasicPipelineExecutor(this._renderer).renderViews(renderPipeline, output, views);
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
