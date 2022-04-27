/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import { RenderPipelineProvider } from './RenderPipelineProvider';

export interface PipelineExecutor {
  render(renderPipeline: RenderPipelineProvider, camera: THREE.Camera): void;
}
