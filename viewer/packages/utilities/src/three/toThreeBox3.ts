/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';
import { BoundingBox3D } from '@cognite/sdk';

export function toThreeBox3(boundingBox: BoundingBox3D, out?: THREE.Box3): THREE.Box3 {
  out = out ?? new THREE.Box3();
  out.min.set(boundingBox.min[0], boundingBox.min[1], boundingBox.min[2]);
  out.max.set(boundingBox.max[0], boundingBox.max[1], boundingBox.max[2]);
  return out;
}
