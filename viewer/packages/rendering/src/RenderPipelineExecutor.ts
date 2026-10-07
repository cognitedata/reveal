/*!
 * Copyright 2022 Cognite AS
 */

import type { Camera, PerspectiveCamera, Vector4, WebGLRenderTarget } from 'three';
import type { RenderPipelineProvider } from './RenderPipelineProvider';
import type { SettableRenderTarget } from './rendering/SettableRenderTarget';

/**
 * One view of a multi-view render, e.g. one eye in WebXR stereo rendering.
 */
export type RenderView = {
  camera: PerspectiveCamera;
  /** Region of the output render target to render into, in pixels (x, y, width, height). */
  viewport: Vector4;
};

/**
 * The job of the implementor of this interface is to exectute some subset of
 * a given pipeline from a RenderPipelineProvider.
 */
export interface RenderPipelineExecutor {
  render(renderPipeline: RenderPipelineProvider, camera: Camera): void;
  /**
   * Runs the complete pipeline once per view, each time writing the result into the view's
   * viewport of the given output target. The pipeline's own output target is left unchanged.
   */
  renderViews(
    renderPipeline: RenderPipelineProvider & SettableRenderTarget,
    output: WebGLRenderTarget,
    views: readonly RenderView[]
  ): void;
  dispose(): void;
}
