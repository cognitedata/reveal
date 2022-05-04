/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';

export function toVector3(v: number[], offset?: number): THREE.Vector3 {
  return new THREE.Vector3().fromArray(v, offset || 0);
}

export function toBox3(b: number[]): THREE.Box3 {
  return new THREE.Box3(toVector3(b), toVector3(b, 3));
}

export function sphereFrom(b: THREE.Box3): THREE.Sphere {
  return b.getBoundingSphere(new THREE.Sphere());
}
