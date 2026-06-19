/*!
 * Copyright 2022 Cognite AS
 */

import { Box3, Sphere, Vector3 } from 'three';

export function toVector3(v: number[], offset?: number): Vector3 {
  return new Vector3().fromArray(v, offset || 0);
}

export function toBox3(b: number[]): Box3 {
  return new Box3(toVector3(b), toVector3(b, 3));
}

export function sphereFrom(b: Box3): Sphere {
  return b.getBoundingSphere(new Sphere());
}
