/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';

import { SectorMetadata, traverseDepthFirst } from '@reveal/cad-parsers';

export interface SuggestedCameraConfig {
  position: THREE.Vector3;
  target: THREE.Vector3;
  near: number;
  far: number;
}

export function suggestCameraConfig(rootSector: SectorMetadata): SuggestedCameraConfig {
  const averageMin = new THREE.Vector3();
  const averageMax = new THREE.Vector3();
  let count = 0;

  traverseDepthFirst(rootSector, node => {
    averageMin.add(node.bounds.min);
    averageMax.add(node.bounds.max);
    count += 1;
    return true;
  });

  averageMin.divideScalar(count);
  averageMax.divideScalar(count);

  const bounds = new THREE.Box3(averageMin, averageMax);
  const target = bounds.getCenter(new THREE.Vector3());
  const extent = bounds.getSize(new THREE.Vector3());
  extent.x *= -2.0;
  extent.y *= -2.0;
  extent.z *= 2.0;

  const position = new THREE.Vector3().addVectors(target, extent);

  return {
    position,
    target,
    near: 0.1,
    far: position.distanceTo(target) * 12
  };
}
