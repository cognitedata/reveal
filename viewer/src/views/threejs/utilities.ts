/*!
 * Copyright 2019 Cognite AS
 */

import * as THREE from 'three';
import { Box3 } from '../../utils/Box3';
import { vec3, mat4 } from 'gl-matrix';

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

export function toThreeVector3(v: vec3): THREE.Vector3 {
  return new THREE.Vector3(v[0], v[1], v[2]);
}

export function toThreeMatrix4(m: mat4): THREE.Matrix4 {
  return new THREE.Matrix4().fromArray(m);
}
