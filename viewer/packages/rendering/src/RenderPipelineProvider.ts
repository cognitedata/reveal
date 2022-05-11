/*!
 * Copyright 2022 Cognite AS
 */

import { RenderPass } from './RenderPass';

export interface RenderPipelineProvider {
  pipeline(renderer: THREE.WebGLRenderer): Generator<RenderPass>;
  dispose(): void;
}
