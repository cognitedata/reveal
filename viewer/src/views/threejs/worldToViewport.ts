/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';

// Should be somewhere else??
export interface Position2D {
  x: number;
  y: number;
}

export function from3DPositionToNormalizedDeviceCoordinates(
  camera: THREE.PerspectiveCamera,
  position3D: THREE.Vector3
): THREE.Vector3 {
  return position3D.clone().project(camera);
}

export function worldToViewport(
  canvas: HTMLCanvasElement,
  camera: THREE.PerspectiveCamera,
  position3D: THREE.Vector3
): Position2D {
  const normalizedDeviceCoordinates = from3DPositionToNormalizedDeviceCoordinates(camera, position3D);
  return {
    x: Math.round((0.5 + normalizedDeviceCoordinates.x / 2) * (canvas.width / window.devicePixelRatio)),
    y: Math.round((0.5 + normalizedDeviceCoordinates.y / 2) * (canvas.height / window.devicePixelRatio))
  };
}
