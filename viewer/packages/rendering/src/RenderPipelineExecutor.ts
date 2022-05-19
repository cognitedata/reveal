/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import { RenderPipelineProvider } from './RenderPipelineProvider';

export interface RenderPipelineExecutor {
  render(renderPipeline: RenderPipelineProvider, camera: THREE.Camera): void;
}
