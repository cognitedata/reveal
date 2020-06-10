/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';

// Should be somewhere else??
interface Position2D {
  x: number;
  y: number;
}

export function from3DPositionToRelativeViewportCoordinates(
  camera: THREE.PerspectiveCamera,
  position3D: THREE.Vector3
): THREE.Vector3 {
  const relativePosition = position3D.clone().project(camera);
  relativePosition.y = -relativePosition.y;
  relativePosition.addScalar(1).multiplyScalar(0.5); // Is it better to have a multiply with a 0.5, -0.5 vector?
  return relativePosition;
}

export function worldToViewport(
  canvas: HTMLCanvasElement,
  camera: THREE.PerspectiveCamera,
  position3D: THREE.Vector3
): Position2D {
  const relativeCoordinates = from3DPositionToRelativeViewportCoordinates(camera, position3D);
  return {
    x: Math.round(relativeCoordinates.x * (canvas.width / window.devicePixelRatio)),
    y: Math.round(relativeCoordinates.y * (canvas.height / window.devicePixelRatio))
  };
}
