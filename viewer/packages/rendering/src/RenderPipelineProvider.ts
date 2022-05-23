/*!
 * Copyright 2022 Cognite AS
 */

import { RenderPass } from './RenderPass';

/**
 * Defines a provider that provides a set of renderpasses
 * in the form of a generator.
 * Note that though a render pipeline may be terminated early
 * skipping any passes may yield undefined behaviour for following
 * render passes given some dependency.
 */
export interface RenderPipelineProvider {
  pipeline(renderer: THREE.WebGLRenderer): Generator<RenderPass>;
  dispose(): void;
}
