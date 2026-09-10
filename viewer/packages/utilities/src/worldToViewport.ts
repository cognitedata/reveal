/*!
 * Copyright 2021 Cognite AS
 */

import type { PerspectiveCamera } from 'three';
import { Vector2, Vector3 } from 'three';

const worldToViewportVars = {
  renderSize: new Vector2(),
  position: new Vector3()
};

/**
 * Maps from 3D world coordinates to normalized screen coordinates
 * relative to the canvas being rendered to. X and Y will
 * be in range [0, 1]. Z is in range [-1, 1] if the coordinate
 * is inside the camera near and far planes.
 * @param camera      Camera used to project point from 3D to NDC coordinates
 * @param position3D  World position in 3D
 * @param out         Optionally pre-allocated Vector3
 * @returns           Relative screen coordinates in X, Y and Z in range [-1, 1] if point
 * is within near/far of camera.
 */

export function worldToNormalizedViewportCoordinates(
  camera: PerspectiveCamera,
  position3D: Vector3,
  out: Vector3 = new Vector3()
): Vector3 {
  const { position } = worldToViewportVars;

  // map to normalized device coordinate (NDC) space
  position.copy(position3D);
  position.project(camera);

  // map to 2D screen space
  const x = (position.x + 1) / 2;
  const y = (-position.y + 1) / 2;

  return out.set(x, y, position.z);
}

/**
 * Maps from 3D world coordinates to screen coordinates
 * relative to the canvas. X and Y will be in absolute
 * coordinates (0,0 being the top left of the canvas). Z is
 * in range [-1, 1] if the coordinate
 * is inside the camera near and far planes.
 * @param canvas      Renderer canvas used to render the "world"
 * @param camera      Camera used to project point from 3D to NDC coordinates
 * @param position3D  World position in 3D
 * @param out         Optionally pre-allocated Vector3
 * @returns           Relative screen coordinates in X, Y and Z in range [-1, 1] if point
 * is within near/far of camera.
 */
export function worldToViewportCoordinates(
  canvas: HTMLCanvasElement,
  camera: PerspectiveCamera,
  position3D: Vector3,
  out: Vector3 = new Vector3()
): Vector3 {
  worldToNormalizedViewportCoordinates(camera, position3D, out);

  const { width: canvasWidth, height: canvasHeight } = canvas.getBoundingClientRect();

  out.x = Math.round(out.x * canvasWidth);
  out.y = Math.round(out.y * canvasHeight);
  return out;
}

/**
 * Converts a pixel coordinate to normalized device coordinate (in range [-1, 1])
 */
export function getNormalizedPixelCoordinatesBySize(
  pixelX: number,
  pixelY: number,
  width: number,
  height: number
): Vector2 {
  return new Vector2((pixelX / width) * 2 - 1, -(pixelY / height) * 2 + 1);
}

export function getNormalizedPixelCoordinates(domElement: HTMLElement, pixelX: number, pixelY: number): Vector2 {
  const { width, height } = domElement.getBoundingClientRect();
  if (width === 0 || height === 0) {
    return new Vector2();
  }
  return getNormalizedPixelCoordinatesBySize(pixelX, pixelY, width, height);
}
