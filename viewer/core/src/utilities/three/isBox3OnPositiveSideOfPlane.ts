/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';
import { iterateBox3CornerPoints } from './box3CornerPoints';

/**
 * Returns true if all corner point of the box provides is on the "positive side"
 * of the plane provided (i.e. the corner point has a non-negative signed distance to the
 * plane)
 */
export function isBox3OnPositiveSideOfPlane(box: THREE.Box3, plane: THREE.Plane): boolean {
  let planeAccepts = false;
  for (const boundCorner of iterateBox3CornerPoints(box)) {
    planeAccepts = plane.distanceToPoint(boundCorner) >= 0 || planeAccepts;
  }
  return planeAccepts;
}
