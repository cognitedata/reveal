/*!
 * Copyright 2024 Cognite AS
 */

import { type Vector3, type Vector2 } from 'three';
import { square } from './mathExtensions';

export function horizontalAngle(vector: Vector3): number {
  // computes the angle in radians with respect to the positive x-axis
  // Copied from tree.js source code (https://github.com/mrdoob/three.js/blob/master/src/math/Vector2.js)
  return Math.atan2(-vector.y, -vector.x) + Math.PI;
}

export function horizontalDistanceTo(from: Vector3, to: Vector3): number {
  return Math.sqrt(square(from.x - to.x) + square(from.y - to.y));
}

export function verticalDistanceTo(from: Vector3, to: Vector3): number {
  return Math.abs(from.z - to.z);
}

export function rotateHorizontal(vector: Vector3, angle: number): void {
  const dx = vector.x;
  vector.x = dx * Math.cos(angle) - vector.y * Math.sin(angle);
  vector.y = dx * Math.sin(angle) + vector.y * Math.cos(angle);
}

export function getAbsMaxComponentIndex(vector: Vector3): number {
  let max = 0;
  let maxIndex = 0;
  for (let index = 0; index < 3; index++) {
    const value = Math.abs(vector.getComponent(index));
    if (value < max) {
      continue;
    }
    maxIndex = index;
    max = value;
  }
  return maxIndex;
}

export function getHorizontalCrossProduct(self: Vector3, other: Vector3): number {
  return self.x * other.y - self.y * other.x;
}

export function rotatePiHalf(vector: Vector3): void {
  const x = vector.x;
  vector.x = -vector.y;
  vector.y = x;
}

export function getOctDir(vector: Vector2): number {
  // The octdirs are:
  //         North (Positive Y-axis)
  //        3  2  1
  // West   4  *  0 East (Positive X-axis)
  //        5  6  7
  //         South
  const angle = vector.angle();

  // Normalize angle to (0,1) so it is easier to work with
  let normalized = angle / (2 * Math.PI);

  // Force between 0 and 1
  while (normalized < 0) normalized += 1;
  while (normalized > 1) normalized -= 1;

  // Convert it to integer between 0 and 7
  const octdir = Math.round(8 * normalized);

  // Check to be sure
  if (octdir >= 8) {
    return octdir - 8;
  }
  if (octdir < 0) {
    return octdir + 8;
  }
  return octdir;
}
