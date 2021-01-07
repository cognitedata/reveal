/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { vec3 } from 'gl-matrix';
import { Box3 } from './Box3';

export function toThreeVector3(out: THREE.Vector3, v: vec3): THREE.Vector3 {
  out.set(v[0], v[1], v[2]);
  return out;
}

function fromThreeVector3(out: vec3, m: THREE.Vector3): vec3 {
  const original = vec3.set(out, m.x, m.y, m.z);
  return original;
}

const toThreeJsBox3Vars = {
  outMin: new THREE.Vector3(),
  outMax: new THREE.Vector3()
};

export function toThreeJsBox3(out: THREE.Box3, box: Box3): THREE.Box3 {
  const { outMin, outMax } = toThreeJsBox3Vars;
  out.set(toThreeVector3(outMin, box.min), toThreeVector3(outMax, box.max));
  return out;
}

const fromThreeJsBox3Vars = {
  min: vec3.create(),
  max: vec3.create()
};

export function fromThreeJsBox3(box: THREE.Box3): Box3 {
  const { min, max } = fromThreeJsBox3Vars;
  fromThreeVector3(min, box.min);
  fromThreeVector3(max, box.max);
  return new Box3([min, max]);
}
