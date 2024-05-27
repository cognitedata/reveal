/*!
 * Copyright 2024 Cognite AS
 */
import { Vector3, type Ray } from 'three';

/**
 * Calculates the closest point on a line to a given ray.
 * @param ray - The ray to calculate the closest point from.
 * @param lineDirection - The direction of the line.
 * @param pointOnLine - A point on the line.
 * @param optionalClosestPointOnLine - An optional Vector3 to store the closest point on the line.
 * @returns The closest point on the line to the ray.
 */
export function getClosestPointOnLine(
  ray: Ray,
  lineDirection: Vector3,
  pointOnLine: Vector3,
  optionalClosestPointOnLine?: Vector3
): Vector3 {
  if (optionalClosestPointOnLine === undefined) {
    optionalClosestPointOnLine = new Vector3();
  }
  // Three.js lack a distance to line function, so use the line segment function
  const lineLength = ray.distanceToPoint(pointOnLine) * 100;
  const v0 = pointOnLine.clone().addScaledVector(lineDirection, -lineLength);
  const v1 = pointOnLine.clone().addScaledVector(lineDirection, +lineLength);
  ray.distanceSqToSegment(v0, v1, undefined, optionalClosestPointOnLine);
  return optionalClosestPointOnLine;
}
