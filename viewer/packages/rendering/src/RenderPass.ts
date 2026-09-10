/*!
 * Copyright 2022 Cognite AS
 */

import type { Camera, WebGLRenderer } from 'three';

/**
 * The RenderPass interface describes some render pass
 * that executes some job either for visual presentation or
 * gpu compute task.
 *
 * Usually multiple RenderPass' will be combined and managed by
 * some RenderPipelineProvider that defines the rendering job.
 */
export interface RenderPass {
  render(renderer: WebGLRenderer, camera: Camera): void;
}
