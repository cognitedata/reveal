/*!
 * Copyright 2024 Cognite AS
 */

import { type Vector2 } from 'three';

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
