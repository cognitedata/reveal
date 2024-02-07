/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';

/**
 * Calculates camera position and target that allows to see the content of provided bounding box.
 * @param camera Used camera instance.
 * @param boundingBox Bounding box to be fitted.
 * @param radiusFactor The ratio of the distance from camera to center of box and radius of the box.
 * @returns
 */
export function fitCameraToBoundingBox(
  camera: THREE.PerspectiveCamera,
  boundingBox: THREE.Box3,
  radiusFactor: number = 2
): { position: THREE.Vector3; target: THREE.Vector3 } {
  const boundingSphere = boundingBox.getBoundingSphere(new THREE.Sphere());

  const target = boundingSphere.center;
  const distance = boundingSphere.radius * radiusFactor;
  const direction = new THREE.Vector3(0, 0, -1);
  direction.applyQuaternion(camera.quaternion);

  const position = direction.clone().multiplyScalar(-distance).add(target);

  return { position, target };
}
