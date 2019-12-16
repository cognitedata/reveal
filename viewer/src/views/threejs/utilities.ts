/*!
 * Copyright 2019 Cognite AS
 */

import * as THREE from 'three';
import { Box3 } from '../../utils/Box3';
import { vec3, mat4, vec4 } from 'gl-matrix';
import { SectorModelTransformation } from '../../models/sector/types';

export function fitCameraToBoundingBox(camera: THREE.Camera, bounds: Box3, radiusFactor: number = 4) {
  const min = new THREE.Vector3(bounds.min[0], bounds.min[1], bounds.min[2]);
  const max = new THREE.Vector3(bounds.max[0], bounds.max[1], bounds.max[2]);

  const threeBounds = new THREE.Box3(min, max);
  const boundingSphere = new THREE.Sphere();
  threeBounds.getBoundingSphere(boundingSphere);

  const target = boundingSphere.center;
  const distance = boundingSphere.radius * radiusFactor;

  const direction = new THREE.Vector3(0, 0, -1);
  direction.applyQuaternion(camera.quaternion);

  const position = new THREE.Vector3();
  position
    .copy(direction)
    .multiplyScalar(-distance)
    .add(target);

  camera.position.set(position.x, position.y, position.z);
}

export function toThreeJsBox3(box: Box3): THREE.Box3 {
  return new THREE.Box3(toThreeVector3(box.min), toThreeVector3(box.max));
}

const toThreeVector3Vars = {
  result: vec3.create()
};

// TODO add out parameter
export function toThreeVector3(v: vec3, modelTransformation?: SectorModelTransformation): THREE.Vector3 {
  if (!modelTransformation) {
    return new THREE.Vector3(v[0], v[1], v[2]);
  }
  const { result } = toThreeVector3Vars;
  vec3.transformMat4(result, v, modelTransformation.modelMatrix);
  return new THREE.Vector3(result[0], result[1], result[2]);
}

const toThreeMatrix4Vars = {
  result: mat4.create()
};

// TODO add out parameter
export function toThreeMatrix4(m: mat4, modelTransformation?: SectorModelTransformation): THREE.Matrix4 {
  if (!modelTransformation) {
    return new THREE.Matrix4().fromArray(m);
  }
  const { result } = toThreeMatrix4Vars;
  mat4.multiply(result, modelTransformation.modelMatrix, m);
  return new THREE.Matrix4().fromArray(result);
}

export function fromThreeVector3(out: vec3, m: THREE.Vector3, modelTransformation?: SectorModelTransformation): vec3 {
  const original = vec3.set(out, m.x, m.y, m.z);
  if (!modelTransformation) {
    return original;
  }
  // the fourth component is implicitly 1 in transformMat4
  return vec3.transformMat4(out, original, modelTransformation.inverseModelMatrix);
}

export function fromThreeMatrix(out: mat4, m: THREE.Matrix4, modelTransformation?: SectorModelTransformation): mat4 {
  out[0] = m.elements[0];
  out[1] = m.elements[1];
  out[2] = m.elements[2];
  out[3] = m.elements[3];
  out[4] = m.elements[4];
  out[5] = m.elements[5];
  out[6] = m.elements[6];
  out[7] = m.elements[7];
  out[8] = m.elements[8];
  out[9] = m.elements[9];
  out[10] = m.elements[10];
  out[11] = m.elements[11];
  out[12] = m.elements[12];
  out[13] = m.elements[13];
  out[14] = m.elements[14];
  out[15] = m.elements[15];
  if (modelTransformation) {
    return mat4.multiply(mat4.create(), modelTransformation.inverseModelMatrix, out);
  }
  return out;
}
