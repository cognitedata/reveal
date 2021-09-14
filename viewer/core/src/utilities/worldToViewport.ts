/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

const worldToViewportVars = {
  renderSize: new THREE.Vector2(),
  position: new THREE.Vector3()
};

/**
 * Maps from 3D world coordinates to normalized screen coordinates
 * relative to the canvas being rendered to. X and Y will
 * be in range [0, 1]. Z is in range [-1, 1] if the coordinate
 * is inside the camera near and far planes.
 * @param renderer    Renderer used to render the "world"
 * @param camera      Camera used to project point from 3D to NDC coordinates
 * @param position3D  World position in 3D
 * @param out         Optionally pre-allocated THREE.Vector3
 * @returns           Relative screen coordinates in X, Y and Z in range [-1, 1] if point
 * is within near/far of camera.
 */
export function worldToNormalizedViewportCoordinates(
  renderer: THREE.WebGLRenderer,
  camera: THREE.PerspectiveCamera,
  position3D: THREE.Vector3,
  out: THREE.Vector3 = new THREE.Vector3()
): THREE.Vector3 {
  const { renderSize, position } = worldToViewportVars;
  const canvas = renderer.domElement;
  const pixelRatio = 1; // renderer.getPixelRatio();
  renderer.getSize(renderSize);

  // map to normalized device coordinate (NDC) space
  position.copy(position3D);
  position.project(camera);

  // Compute 'virtual' canvas size
  const { width: canvasWidth, height: canvasHeight } = canvas.getBoundingClientRect();
  const scaleX = renderSize.width / canvasWidth;
  const scaleY = renderSize.height / canvasHeight;

  // map to 2D screen space
  const x = (position.x + 1) / (scaleX * pixelRatio * 2);
  const y = (-position.y + 1) / (scaleY * pixelRatio * 2);

  return out.set(x, y, position.z);
}

/**
 * Maps from 3D world coordinates to screen coordinates
 * relative to the canvas. X and Y will be in absolute
 * coordinates (0,0 being the top left of the canvas). Z is
 * in range [-1, 1] if the coordinate
 * is inside the camera near and far planes.
 * @param renderer    Renderer used to render the "world"
 * @param camera      Camera used to project point from 3D to NDC coordinates
 * @param position3D  World position in 3D
 * @param out         Optionally pre-allocated THREE.Vector3
 * @returns           Relative screen coordinates in X, Y and Z in range [-1, 1] if point
 * is within near/far of camera.
 */
export function worldToViewportCoordinates(
  renderer: THREE.WebGLRenderer,
  camera: THREE.PerspectiveCamera,
  position3D: THREE.Vector3,
  out: THREE.Vector3 = new THREE.Vector3()
): THREE.Vector3 {
  worldToNormalizedViewportCoordinates(renderer, camera, position3D, out);

  const { renderSize } = worldToViewportVars;
  renderer.getSize(renderSize);
  const pixelRatio = renderer.getPixelRatio();

  out.x = Math.round((out.x * renderSize.width) / pixelRatio);
  out.y = Math.round((out.y * renderSize.height) / pixelRatio);
  return out;
}
