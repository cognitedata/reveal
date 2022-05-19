/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';

import { CadGeometryRenderModePipelineProvider } from '@reveal/rendering';

import { SectorCuller } from './SectorCuller';
import { ByVisibilityGpuSectorCuller } from './ByVisibilityGpuSectorCuller';
import { GpuOrderSectorsByVisibilityCoverage } from './OrderSectorsByVisibilityCoverage';

export function createV8SectorCuller(
  renderer: THREE.WebGLRenderer,
  depthOnlyRenderPipeline: CadGeometryRenderModePipelineProvider
): SectorCuller {
  const coverageUtil = new GpuOrderSectorsByVisibilityCoverage({ renderer, depthOnlyRenderPipeline });
  return new ByVisibilityGpuSectorCuller({ renderer, coverageUtil });
}
