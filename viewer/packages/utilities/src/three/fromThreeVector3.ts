/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';

export function fromThreeVector3(vec: THREE.Vector3): [number, number, number] {
  return [vec.x, vec.y, vec.z];
}
