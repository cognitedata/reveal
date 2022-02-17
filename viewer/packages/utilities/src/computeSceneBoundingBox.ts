/*!
 * Copyright 2022 Cognite AS
 */

import { SectorMetadata } from '@reveal/cad-parsers';

import * as THREE from 'three';

export function computeSceneBoundingBox(sectors: SectorMetadata[]): THREE.Box3 {
  const box = new THREE.Box3();

  sectors.forEach(sector => {
    box.expandByPoint(sector.bounds.max);
    box.expandByPoint(sector.bounds.min);
  });

  return box;
}
