/*!
 * Copyright 2024 Cognite AS
 */

import { type Vector2, type Vector3 } from 'three';
import { square } from './mathExtensions';

export function horizontalAngle(vector: Vector3): number {
  // computes the angle in radians with respect to the positive x-axis
  // Copied from tree.js source code (https://github.com/mrdoob/three.js/blob/master/src/math/Vector2.js)
  return Math.atan2(-vector.y, -vector.x) + Math.PI;
}

export function horizontalDistanceTo(p1: Vector3, p2: Vector3): number {
  return Math.sqrt(square(p1.x - p2.x) + square(p1.y - p2.y));
}

export function verticalDistanceTo(p1: Vector3, p2: Vector3): number {
  return Math.abs(p1.z - p2.z);
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
