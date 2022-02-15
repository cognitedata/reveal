/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';

export interface SuggestedCameraConfig {
  position: THREE.Vector3;
  target: THREE.Vector3;
  near: number;
  far: number;
}

const MAX_VERTICAL_ANGLE = (30 / 180) * Math.PI;

function ensureYAngleBelowThresholdForNormalizedVector(direction: THREE.Vector3): void {
  if (direction.y < Math.sin(MAX_VERTICAL_ANGLE)) {
    return;
  }

  let xzProjection = new THREE.Vector2(direction.x, direction.z);
  const xzLength = xzProjection.length();

  xzProjection = xzLength > 1e-4 ? xzProjection : new THREE.Vector2(1.0, 1.0);

  xzProjection.normalize().multiplyScalar(Math.cos(MAX_VERTICAL_ANGLE));

  direction.x = xzProjection.x;
  direction.z = xzProjection.y;

  direction.y = Math.sin(MAX_VERTICAL_ANGLE);
}

export type BaseSectorMetadata = {
  readonly id: number;
  readonly path: string;
  readonly depth: number;
  readonly bounds: THREE.Box3;
  readonly children: BaseSectorMetadata[];
  readonly estimatedDrawCallCount: number;
  readonly estimatedRenderCost: number;
};

export function suggestCameraConfig(rootSector: BaseSectorMetadata, modelMatrix: THREE.Matrix4): SuggestedCameraConfig {
  const averageMin = new THREE.Vector3();
  const averageMax = new THREE.Vector3();
  let count = 0;

  function traverseDepthFirst(sector: BaseSectorMetadata, func: (v: BaseSectorMetadata) => void) {
    func(sector);
    for (const child of sector.children) {
      traverseDepthFirst(child, func);
    }
  }

  traverseDepthFirst(rootSector, node => {
    averageMin.add(node.bounds.min);
    averageMax.add(node.bounds.max);
    count += 1;
    return true;
  });

  averageMin.divideScalar(count);
  averageMax.divideScalar(count);

  const bounds = new THREE.Box3(averageMin, averageMax);
  bounds.applyMatrix4(modelMatrix);

  const target = bounds.getCenter(new THREE.Vector3());
  const extent = bounds.getSize(new THREE.Vector3());

  const positionDirection = new THREE.Vector3(-1.0 / extent.x, 1.0 / extent.y, -1.0 / extent.z).normalize();
  ensureYAngleBelowThresholdForNormalizedVector(positionDirection);

  positionDirection.multiplyScalar(extent.length());
  const position = new THREE.Vector3().addVectors(target, positionDirection);

  return {
    position,
    target,
    near: 0.1,
    far: position.distanceTo(target) * 12
  };
}
