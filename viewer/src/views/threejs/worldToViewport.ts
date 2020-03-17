/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';

// Should be somewhere else??
export interface Position2D {
  x: number;
  y: number;
}

function from3DPositionToRelativeViewportPosition(
  camera: THREE.PerspectiveCamera,
  position3D: THREE.Vector3
): Position2D {
  const vector = position3D.clone();
  vector.project(camera);
  return { x: 0.5 + vector.x / 2, y: 0.5 - vector.y / 2 };
}

export function worldToViewport(
  canvas: HTMLCanvasElement,
  camera: THREE.PerspectiveCamera,
  position3D: THREE.Vector3
): Position2D {
  const relativePosition2D = from3DPositionToRelativeViewportPosition(camera, position3D);
  return {
    x: Math.round(relativePosition2D.x * (canvas.width / window.devicePixelRatio)),
    y: Math.round(relativePosition2D.y * (canvas.height / window.devicePixelRatio))
  };
}
