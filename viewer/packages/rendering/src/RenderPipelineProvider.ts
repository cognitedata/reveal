/*!
 * Copyright 2026 Cognite AS
 */

import type { RenderPass } from './RenderPass';
import type { RevealRenderer } from './rendering/RevealRenderer';

/**
 * Defines a provider that provides a set of renderpasses
 * in the form of a generator.
 * Note that though a render pipeline may be terminated early
 * skipping any passes may yield undefined behaviour for following
 * render passes given some dependency.
 */
export interface RenderPipelineProvider {
  pipeline(renderer: RevealRenderer): Generator<RenderPass>;
  dispose(): void;
}
