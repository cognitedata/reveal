/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';

import { SectorMetadata } from '@reveal/cad-parsers';
import { traverseDepthFirst } from '@reveal/utilities';

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

  const positionDirection = new THREE.Vector3(-1.0 / extent.x, -1.0 / extent.y, 1.0 / extent.z).normalize();
  positionDirection.multiplyScalar(extent.length());

  const position = new THREE.Vector3().addVectors(target, positionDirection);

  return {
    position,
    target,
    near: 0.1,
    far: position.distanceTo(target) * 12
  };
}
