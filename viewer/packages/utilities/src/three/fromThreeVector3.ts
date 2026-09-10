/*!
 * Copyright 2022 Cognite AS
 */

import type { Vector3 } from 'three';

export function fromThreeVector3(vec: Vector3): [number, number, number] {
  return [vec.x, vec.y, vec.z];
}
