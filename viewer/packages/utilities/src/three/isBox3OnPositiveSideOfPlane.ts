/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';
import { visitBox3CornerPoints } from './visitBox3CornerPoints';

/**
 * Returns true if any corner point of the box provides is on the "positive side"
 * of the plane provided (i.e. the corner point has a non-negative signed distance to the
 * plane)
 */
export function isBox3OnPositiveSideOfPlane(box: THREE.Box3, plane: THREE.Plane): boolean {
  let planeAccepts = false;
  visitBox3CornerPoints(box, boundCorner => {
    planeAccepts = planeAccepts || plane.distanceToPoint(boundCorner) >= 0;
  });
  return planeAccepts;
}
