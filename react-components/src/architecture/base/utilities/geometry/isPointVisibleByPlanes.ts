/*!
 * Copyright 2024 Cognite AS
 */

import { type Box3, type Plane, Vector3 } from 'three';
import { getCorners } from './getCorners';

const tempTarget = new Vector3(); // Used by isBoxPartlyVisibleByPlanes for speed

export function isBoxPartlyVisibleByPlanes(planes: Plane[], box: Box3 | undefined): boolean {
  if (box === undefined) {
    return false;
  }
  for (const corner of getCorners(box, tempTarget)) {
    if (isPointVisibleByPlanes(planes, corner)) {
      return true;
    }
  }
  return false;
}

// TODO: This function is defined in Reveal. Reuse that instead
export function isPointVisibleByPlanes(planes: Plane[], point: Vector3): boolean {
  return planes.every((p) => p.distanceToPoint(point) >= 0);
}
