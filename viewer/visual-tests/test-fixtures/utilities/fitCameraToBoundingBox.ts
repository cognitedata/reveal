/*!
 * Copyright 2022 Cognite AS
 */

import type { Box3, Camera } from 'three';
import { Sphere, Vector3 } from 'three';

export function fitCameraToBoundingBox(
  camera: Camera,
  box: Box3,
  radiusFactor: number = 2
): { position: Vector3; target: Vector3 } {
  const center = new Vector3().lerpVectors(box.min, box.max, 0.5);
  const radius = 0.5 * new Vector3().subVectors(box.max, box.min).length();
  const boundingSphere = new Sphere(center, radius);

  const target = boundingSphere.center;
  const distance = boundingSphere.radius * radiusFactor;
  const direction = new Vector3(0, 0, -1);
  direction.applyQuaternion(camera.quaternion);

  const position = new Vector3();
  position.copy(direction).multiplyScalar(-distance).add(target);

  camera.position.copy(position);

  return { position, target };
}
