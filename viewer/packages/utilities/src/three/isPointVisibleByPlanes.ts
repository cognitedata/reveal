/*!
 * Copyright 2024 Cognite AS
 */

import { Vector3, Plane } from 'three';

export function isPointVisibleByPlanes(planes: Plane[], point: Vector3): boolean {
  return planes.every(p => p.distanceToPoint(point) >= 0);
}
