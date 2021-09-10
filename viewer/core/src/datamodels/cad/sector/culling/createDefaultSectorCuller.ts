/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';
import { SectorCuller } from './SectorCuller';
import { OccludingGeometryProvider } from './OccludingGeometryProvider';
import { ByScreenSizeSectorCuller } from './ByScreenSizeSectorCuller';

export function createDefaultSectorCuller(
  _renderer: THREE.WebGLRenderer,
  _occludingGeometryProvider: OccludingGeometryProvider
): SectorCuller {
  return new ByScreenSizeSectorCuller();
}
