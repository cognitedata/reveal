/*!
 * Copyright 2025 Cognite AS
 */
import { Vector2, Vector3 } from 'three';

export function convertPointsTo3d(points: Vector2[]): Vector3[] {
  const e = 1e-4;
  return points.map(p => new Vector3(p.x, p.y, -e));
}
