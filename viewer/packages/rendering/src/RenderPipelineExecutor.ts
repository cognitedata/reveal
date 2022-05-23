/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import { RenderPipelineProvider } from './RenderPipelineProvider';

/**
 * The job of the implementor of this interface is to exectute some subset of
 * a given pipeline from a RenderPipelineProvider.
 */
export interface RenderPipelineExecutor {
  render(renderPipeline: RenderPipelineProvider, camera: THREE.Camera): void;
}
