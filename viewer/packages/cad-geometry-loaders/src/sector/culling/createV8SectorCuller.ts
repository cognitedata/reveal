/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';

import { SectorCuller } from './SectorCuller';
import { OccludingGeometryProvider } from './OccludingGeometryProvider';

import { ByVisibilityGpuSectorCuller } from '@reveal/cad-geometry-loaders';
import { GpuOrderSectorsByVisibilityCoverage } from './OrderSectorsByVisibilityCoverage';

export function createV8SectorCuller(
  renderer: THREE.WebGLRenderer,
  occludingGeometryProvider: OccludingGeometryProvider
): SectorCuller {
  const coverageUtil = new GpuOrderSectorsByVisibilityCoverage({ renderer, occludingGeometryProvider });
  return new ByVisibilityGpuSectorCuller({ renderer, coverageUtil });
}
