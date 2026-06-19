/*!
 * Copyright 2022 Cognite AS
 */

import type { Box3, PerspectiveCamera } from 'three';
import { Sphere, Vector3 } from 'three';

/**
 * Calculates camera position and target that allows to see the content of provided bounding box.
 * @param camera Used camera instance.
 * @param boundingBox Bounding box to be fitted.
 * @param radiusFactor The ratio of the distance from camera to center of box and radius of the box.
 * @returns
 */
export function fitCameraToBoundingBox(
  camera: PerspectiveCamera,
  boundingBox: Box3,
  radiusFactor: number = 2
): { position: Vector3; target: Vector3 } {
  const boundingSphere = boundingBox.getBoundingSphere(new Sphere());

  const target = boundingSphere.center;
  const distance = boundingSphere.radius * radiusFactor;
  const direction = new Vector3(0, 0, -1);
  direction.applyQuaternion(camera.quaternion);

  const position = direction.clone().multiplyScalar(-distance).add(target);

  return { position, target };
}
