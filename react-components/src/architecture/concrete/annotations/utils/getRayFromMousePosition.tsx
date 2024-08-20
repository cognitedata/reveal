/*!
 * Copyright 2024 Cognite AS
 */

import { Ray } from 'three';

import {
  type Cognite3DViewer,
  type PointerEventData,
  getNormalizedPixelCoordinates
} from '@cognite/reveal';

export function getRayFromMousePosition(event: PointerEventData, viewer: Cognite3DViewer): Ray {
  const normalizedCoord = getNormalizedPixelCoordinates(
    viewer.domElement,
    event.offsetX,
    event.offsetY
  );
  const ray = new Ray();
  const camera = viewer.cameraManager.getCamera();
  ray.origin.setFromMatrixPosition(camera.matrixWorld);
  ray.direction
    .set(normalizedCoord.x, normalizedCoord.y, 0.5)
    .unproject(camera)
    .sub(ray.origin)
    .normalize();
  return ray;
}
