/*!
 * Copyright 2023 Cognite AS
 */

import clamp from 'lodash/clamp';
import maxBy from 'lodash/maxBy';
import minBy from 'lodash/minBy';
import { Box2, Box3, Matrix4, Vector2 } from 'three';
import { getBox3CornerPoints } from './three/visitBox3CornerPoints';

export function getApproximateProjectedBounds(box: Box3, viewProjectionMatrix: Matrix4): Box2 {
  const corners = getBox3CornerPoints(box);

  corners.forEach(corner => corner.applyMatrix4(viewProjectionMatrix));

  const xMin = minBy(corners, corner => corner.x / corner.w)!;
  const yMin = minBy(corners, corner => corner.y / corner.w)!;

  const xMax = maxBy(corners, corner => corner.x / corner.w)!;
  const yMax = maxBy(corners, corner => corner.y / corner.w)!;

  return new Box2(new Vector2(xMin.x / xMin.w, yMin.y / yMin.w), new Vector2(xMax.x / xMax.w, yMax.y / yMax.w));
}

export function getScreenArea(projectedBounds: Box2): number {
  const clampedMinX = clamp(projectedBounds.min.x * 0.5 + 0.5, 0, 1);
  const clampedMinY = clamp(projectedBounds.min.y * 0.5 + 0.5, 0, 1);

  const clampedMaxX = clamp(projectedBounds.max.x * 0.5 + 0.5, 0, 1);
  const clampedMaxY = clamp(projectedBounds.max.y * 0.5 + 0.5, 0, 1);

  return (clampedMaxX - clampedMinX) * (clampedMaxY - clampedMinY);
}
