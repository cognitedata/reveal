/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';

/**
 * The RenderPass interface describes some render pass
 * that executes some job either for visual presentation or
 * gpu compute task.
 *
 * Usually multiple RenderPass' will be combined and managed by
 * some RenderPipelineProvider that defines the rendering job.
 */
export interface RenderPass {
  render(renderer: THREE.WebGLRenderer, camera: THREE.Camera): void;
}
