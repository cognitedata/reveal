/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';

import { CadGeometryRenderModePipelineProvider } from '@reveal/rendering';

import { SectorCuller } from './SectorCuller';
import { ByVisibilityGpuSectorCuller } from './ByVisibilityGpuSectorCuller';
import { GpuOrderSectorsByVisibilityCoverage } from './OrderSectorsByVisibilityCoverage';

export function createV8SectorCuller(depthOnlyRenderPipeline: CadGeometryRenderModePipelineProvider): SectorCuller {
  const renderer = new THREE.WebGLRenderer();
  const coverageUtil = new GpuOrderSectorsByVisibilityCoverage({ renderer: renderer, depthOnlyRenderPipeline });
  return new ByVisibilityGpuSectorCuller({ renderer: renderer, coverageUtil });
}
