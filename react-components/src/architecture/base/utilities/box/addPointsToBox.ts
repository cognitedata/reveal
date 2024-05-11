/*!
 * Copyright 2024 Cognite AS
 */

import { Matrix4, type Vector3 } from 'three';
import { horizontalAngle } from '../extensions/vectorExtensions';
import { Range3 } from '../geometry/Range3';
import { type IBox } from './IBox';
import { forceBetween0AndPi } from '../extensions/mathExtensions';

/**
 * Create the box by adding points. The first point will make a boc with a center and a tiny size.
 * The second point will give the zRotation and one edge of the box
 * the other will expand the box to include the point.
 *
 * @param box - The box to add points to.
 * @param points - An array of points to add to the box.
 * @throws Error if points array is empty.
 */
export function addPointsToBox(box: IBox, points: Vector3[]): void {
  if (points.length === 0) {
    throw new Error('Cannot create a box without points');
  }
  if (points.length <= 2) {
    if (points.length === 1) {
      // Calculate center and size
      // const margin = distance * MARGIN_FACTOR;
      // range.expandByMargin(margin);
      box.forceMinSize();
      box.center.copy(points[0]);
      return;
    } else if (points.length === 2) {
      // Calculate center and size
      // const range = new Range3();
      // for (const point of points) {
      //   range.add(point);
      // }
      // box.center.copy(range.center);
      // box.size.x = horizontalDistanceTo(points[0], points[1]);
      // box.forceMinSize();

      // Calculate zRotation
      const vector = points[1].clone();
      vector.sub(points[0]);
      box.zRotation = forceBetween0AndPi(horizontalAngle(vector));
    }
  }
  const matrix = new Matrix4().makeRotationZ(box.zRotation);
  const inverseMatrix = matrix.clone().invert();
  const rotatedRange = new Range3();
  for (const point of points) {
    const copy = point.clone();
    copy.applyMatrix4(inverseMatrix);
    rotatedRange.add(copy);
  }
  const center = rotatedRange.center;
  const delta = rotatedRange.delta;
  center.applyMatrix4(matrix);
  box.size.copy(delta);
  box.forceMinSize();
  box.center.copy(center);
}
