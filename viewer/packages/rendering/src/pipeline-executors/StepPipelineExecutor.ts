/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import { RenderPipelineExecutor } from '../RenderPipelineExecutor';
import { RenderPipelineProvider } from '../RenderPipelineProvider';
import { GpuTimer } from '../utilities/GpuTimer';

export class StepPipelineExecutor implements RenderPipelineExecutor {
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

  public render(renderPipeline: RenderPipelineProvider, camera: THREE.Camera): void {
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
}
