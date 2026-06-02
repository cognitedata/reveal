/*!
 * Copyright 2022 Cognite AS
 */

import type * as THREE from 'three';
import type { RenderPipelineProvider } from './RenderPipelineProvider';

/**
 * The job of the implementor of this interface is to exectute some subset of
 * a given pipeline from a RenderPipelineProvider.
 */
export interface RenderPipelineExecutor {
  render(renderPipeline: RenderPipelineProvider, camera: THREE.Camera): void;
  dispose(): void;
}
