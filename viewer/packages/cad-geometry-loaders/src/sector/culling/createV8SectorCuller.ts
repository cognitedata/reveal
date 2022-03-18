/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';

import { EffectRenderManager } from '@reveal/rendering';

import { SectorCuller } from './SectorCuller';
import { ByVisibilityGpuSectorCuller } from './ByVisibilityGpuSectorCuller';
import { GpuOrderSectorsByVisibilityCoverage } from './OrderSectorsByVisibilityCoverage';

export function createV8SectorCuller(renderer: THREE.WebGLRenderer, renderManager: EffectRenderManager): SectorCuller {
  const coverageUtil = new GpuOrderSectorsByVisibilityCoverage({ renderer, renderManager });
  return new ByVisibilityGpuSectorCuller({ renderer, coverageUtil });
}
