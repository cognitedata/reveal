/*!
 * Copyright 2022 Cognite AS
 */

import { Plane } from 'three';

export function combineClippingPlanes(planes0: Plane[],
                                      planes1: Plane[]): Plane[] {
  // const combinedPlanes = [...planes0];
  const combinedPlanes = planes0.map(p => p.clone());
  for (const candidatePlane of planes1) {
    let foundMatchingPlane = false;
    for (const combinedPlane of combinedPlanes) {
      if (combinedPlane.normal.dot(candidatePlane.normal) >= 1 - 1e-3) {
        combinedPlane.constant = Math.min(combinedPlane.constant, candidatePlane.constant);

        foundMatchingPlane = true;
      }
    }

    if (!foundMatchingPlane) {
      combinedPlanes.push(candidatePlane);
    }
  }

  return combinedPlanes;
}
