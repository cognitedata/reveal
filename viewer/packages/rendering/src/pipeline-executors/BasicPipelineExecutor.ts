/*!
 * Copyright 2022 Cognite AS
 */

import { Vector2, Vector4, type PerspectiveCamera, type WebGLRenderer, type WebGLRenderTarget } from 'three';
import { setRenderSizeOverride } from '@reveal/utilities';
import type { RenderPipelineExecutor, RenderView } from '../RenderPipelineExecutor';
import type { RenderPipelineProvider } from '../RenderPipelineProvider';
import type { SettableRenderTarget } from '../rendering/SettableRenderTarget';

export class BasicPipelineExecutor implements RenderPipelineExecutor {
  private readonly _renderer: WebGLRenderer;

  constructor(renderer: WebGLRenderer) {
    this._renderer = renderer;

    renderer.info.autoReset = false;
  }

  public render(renderPipeline: RenderPipelineProvider, camera: PerspectiveCamera): void {
    this._renderer.info.reset();
    this.executePipeline(renderPipeline, camera);
  }

  public renderViews(
    renderPipeline: RenderPipelineProvider & SettableRenderTarget,
    output: WebGLRenderTarget,
    views: readonly RenderView[]
  ): void {
    const renderer = this._renderer;
    const previousTarget = renderPipeline.outputRenderTarget;
    const previousAutoSize = renderPipeline.autoSizeOutputRenderTarget;
    const previousViewport = output.viewport.clone();
    const previousScissor = output.scissor.clone();
    const previousScissorTest = output.scissorTest;
    // With xr.enabled, three.js replaces the camera with its own stereo camera in every
    // renderer.render() call while presenting. Reveal's passes must use the view camera as given.
    const previousXrEnabled = renderer.xr.enabled;
    const viewSize = new Vector2();

    renderer.info.reset();
    try {
      renderer.xr.enabled = false;
      renderPipeline.setOutputRenderTarget(output, false);
      for (const view of views) {
        if (view.viewport.z < 1 || view.viewport.w < 1) {
          continue;
        }
        output.viewport.copy(roundViewport(view.viewport));
        // Restricts clears to this view, so the next view doesn't wipe the previous one.
        output.scissor.copy(output.viewport);
        output.scissorTest = true;
        setRenderSizeOverride(renderer, viewSize.set(output.viewport.z, output.viewport.w));
        this.executePipeline(renderPipeline, view.camera);
      }
    } finally {
      setRenderSizeOverride(renderer, undefined);
      output.viewport.copy(previousViewport);
      output.scissor.copy(previousScissor);
      output.scissorTest = previousScissorTest;
      renderPipeline.setOutputRenderTarget(previousTarget, previousAutoSize);
      renderer.xr.enabled = previousXrEnabled;
    }
  }

  dispose(): void {}

  private executePipeline(renderPipeline: RenderPipelineProvider, camera: PerspectiveCamera): void {
    for (const renderPass of renderPipeline.pipeline(this._renderer)) {
      renderPass.render(this._renderer, camera);
    }
  }
}

function roundViewport(viewport: Vector4): Vector4 {
  return new Vector4(Math.round(viewport.x), Math.round(viewport.y), Math.round(viewport.z), Math.round(viewport.w));
}
