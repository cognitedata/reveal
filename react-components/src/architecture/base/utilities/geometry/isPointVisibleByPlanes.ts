/*!
 * Copyright 2024 Cognite AS
 */

import { type Box3, type Plane, Vector3 } from 'three';
import { getCorners } from './getCorners';

const tempTarget = new Vector3(); // Reuse this vector to avoid creating a new one every time

export function isPartOfBoxVisibleByPlanes(planes: Plane[], box: Box3): boolean {
  if (box.isEmpty()) {
    return false;
  }
  for (const corner of getCorners(box, tempTarget)) {
    if (isPointVisibleByPlanes(planes, corner)) {
      return true;
    }
  }
  return false;
}

export function isEntireBoxVisibleByPlanes(planes: Plane[], box: Box3): boolean {
  if (box.isEmpty()) {
    return false;
  }
  for (const corner of getCorners(box, tempTarget)) {
    if (!isPointVisibleByPlanes(planes, corner)) {
      return false;
    }
  }
  return true;
}

// TODO: This function is defined in Reveal. Reuse that instead?
export function isPointVisibleByPlanes(planes: Plane[], point: Vector3): boolean {
  return planes.every((p) => p.distanceToPoint(point) >= 0);
}
