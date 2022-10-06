/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';

export function fitCameraToBoundingBox(
  camera: THREE.Camera,
  box: THREE.Box3,
  radiusFactor: number = 2
): { position: THREE.Vector3; target: THREE.Vector3 } {
  const center = new THREE.Vector3().lerpVectors(box.min, box.max, 0.5);
  const radius = 0.5 * new THREE.Vector3().subVectors(box.max, box.min).length();
  const boundingSphere = new THREE.Sphere(center, radius);

  const target = boundingSphere.center;
  const distance = boundingSphere.radius * radiusFactor;
  const direction = new THREE.Vector3(0, 0, -1);
  direction.applyQuaternion(camera.quaternion);

  const position = new THREE.Vector3();
  position.copy(direction).multiplyScalar(-distance).add(target);

  camera.position.copy(position);

  return { position, target };
}
