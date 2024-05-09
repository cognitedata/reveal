/*!
 * Copyright 2024 Cognite AS
 */

import { type Vector2, type Vector3 } from 'three';
import { square } from '../extensions/mathExtensions';

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
  const angle = vector.angle();

  // Convert from math to compass angle (0 at north, clockwise)
  const compassAngle = Math.PI / 2 - angle;

  // Normalize angle to (0,1) so it is easier to work with
  let normalized = compassAngle / (2 * Math.PI);

  // Force between 0 and 1
  while (normalized < 0) normalized += 1;
  while (normalized > 1) normalized -= 1;

  // Convert it to integer between 0 and 7
  const octdir = Math.round(8 * normalized);
  if (octdir >= 8) {
    return octdir - 8;
  }
  if (octdir < 0) {
    return octdir + 8;
  }
  return octdir;
}

export function getResizeCursor(octdir: number): string | undefined {
  // https://developer.mozilla.org/en-US/docs/Web/CSS/cursor

  switch (octdir) {
    case 0:
    case 4:
      return 'ns-resize';

    case 1:
    case 5:
      return 'nesw-resize';

    case 2:
    case 6:
      return 'ew-resize';

    case 3:
    case 7:
      return 'nwse-resize';

    default:
      return undefined;
  }
}
