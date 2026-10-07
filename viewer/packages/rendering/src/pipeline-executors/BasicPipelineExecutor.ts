/*!
 * Copyright 2022 Cognite AS
 */

import { Vector2, Vector4, type PerspectiveCamera, type WebGLRenderer, type WebGLRenderTarget } from 'three';
import { getRenderSizeOverride, setRenderSizeOverride } from '@reveal/utilities';
import type { RenderPipelineExecutor, RenderView } from '../RenderPipelineExecutor';
import type { RenderPipelineProvider } from '../RenderPipelineProvider';
import type { SettableRenderTarget } from '../rendering/SettableRenderTarget';

export class BasicPipelineExecutor implements RenderPipelineExecutor {
  private readonly _renderer: WebGLRenderer;
  private readonly _previousViewport = new Vector4();
  private readonly _previousScissor = new Vector4();
  private readonly _viewSize = new Vector2();

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
    const previousBoundTarget = renderer.getRenderTarget();
    const previousOutputTarget = renderPipeline.outputRenderTarget;
    const previousAutoSize = renderPipeline.autoSizeOutputRenderTarget;
    const previousRenderSizeOverride = getRenderSizeOverride(renderer);
    const previousViewport = this._previousViewport.copy(output.viewport);
    const previousScissor = this._previousScissor.copy(output.scissor);
    const previousScissorTest = output.scissorTest;
    // With xr.enabled, three.js replaces the camera with its own stereo camera in every
    // renderer.render() call while presenting. Reveal's passes must use the view camera as given.
    const previousXrEnabled = renderer.xr.enabled;

    renderer.info.reset();
    try {
      renderer.xr.enabled = false;
      renderPipeline.setOutputRenderTarget(output, false);
      for (const view of views) {
        if (view.viewport.z < 1 || view.viewport.w < 1) {
          continue;
        }
        roundViewport(view.viewport, output.viewport);
        // Restricts clears to this view, so the next view doesn't wipe the previous one.
        output.scissor.copy(output.viewport);
        output.scissorTest = true;
        setRenderSizeOverride(renderer, this._viewSize.set(output.viewport.z, output.viewport.w));
        this.executePipeline(renderPipeline, view.camera);
      }
    } finally {
      setRenderSizeOverride(renderer, previousRenderSizeOverride);
      output.viewport.copy(previousViewport);
      output.scissor.copy(previousScissor);
      output.scissorTest = previousScissorTest;
      renderPipeline.setOutputRenderTarget(previousOutputTarget, previousAutoSize);
      renderer.xr.enabled = previousXrEnabled;
      // Rebinding also resets the GL viewport/scissor state, which still has the last view's values.
      renderer.setRenderTarget(previousBoundTarget);
    }
  }

  dispose(): void {}

  private executePipeline(renderPipeline: RenderPipelineProvider, camera: PerspectiveCamera): void {
    for (const renderPass of renderPipeline.pipeline(this._renderer)) {
      renderPass.render(this._renderer, camera);
    }
  }
}

function roundViewport(viewport: Vector4, target: Vector4): Vector4 {
  return target.set(Math.round(viewport.x), Math.round(viewport.y), Math.round(viewport.z), Math.round(viewport.w));
}
