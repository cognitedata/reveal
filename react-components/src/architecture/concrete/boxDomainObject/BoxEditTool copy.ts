/*!
 * Copyright 2024 Cognite AS
 */
/* eslint-disable @typescript-eslint/class-literal-property-style */

import { type BoxDomainObject } from './BoxDomainObject';
import { Vector2, type Vector3 } from 'three';
import {
  horizontalAngle,
  horizontalDistanceTo
} from '../../base/utilities/geometry/vector3Extensions';
import { Range3 } from '../../base/utilities/geometry/Range3';

const MARGIN_FACTOR = 0.01;

export function makeBox(box: BoxDomainObject, points: Vector3[], distance: number): void {
  if (points.length === 0) {
    throw new Error('Cannot create a box without points');
  }
  if (points.length <= 2) {
    const range = new Range3();
    for (const point of points) {
      range.add(point);
    }
    if (points.length === 1) {
      // Calculate center and size
      const margin = distance * MARGIN_FACTOR;
      range.expandByMargin(margin);
      box.size.copy(range.delta);
      box.center.copy(range.center);
      return;
    } else if (points.length === 2) {
      // Calculate center and size
      box.center.copy(range.center);
      box.size.x = horizontalDistanceTo(points[0], points[1]);

      // Calculate zRotation
      const vector = points[1].clone();
      vector.sub(points[0]);
      box.zRotation = horizontalAngle(vector);
    }
    return;
  }
  const matrix = box.getRotationMatrix();
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
  box.center.copy(center);
}
