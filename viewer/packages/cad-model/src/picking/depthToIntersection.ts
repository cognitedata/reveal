/*!
 * Copyright 2026 Cognite AS
 */

import type { PerspectiveCamera } from 'three';
import { Vector3 } from 'three';

/**
 * Converts a non-linear depth in [0, 1] at the given normalized device coordinates
 * to a world space position and its distance from the camera.
 */
export function depthToIntersection(
  depth: number,
  camera: PerspectiveCamera,
  normalizedCoords: { x: number; y: number }
): { distance: number; point: Vector3 } {
  const viewZ = perspectiveDepthToViewZ(depth, camera.near, camera.far);
  const point = getPosition(camera, normalizedCoords, viewZ);
  const distance = new Vector3().subVectors(point, camera.position).length();
  return { distance, point };
}

function perspectiveDepthToViewZ(invClipZ: number, near: number, far: number): number {
  return (near * far) / ((far - near) * invClipZ - far);
}

function getPosition(camera: PerspectiveCamera, normalizedCoords: { x: number; y: number }, viewZ: number): Vector3 {
  const position = new Vector3();
  position.set(normalizedCoords.x, normalizedCoords.y, 0.5).applyMatrix4(camera.projectionMatrixInverse);

  position.multiplyScalar(viewZ / position.z);
  position.applyMatrix4(camera.matrixWorld);
  return position;
}
