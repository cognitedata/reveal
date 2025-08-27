import { type Box3, type Plane, Vector3 } from 'three';
import { getCorners } from './getCorners';
import { isPointVisibleByPlanes } from '@cognite/reveal';

const tempTarget = new Vector3(); // Reuse this vector to avoid creating a new one every time

export function isAnyCornersVisibleByPlanes(planes: Plane[], box: Box3): boolean {
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
