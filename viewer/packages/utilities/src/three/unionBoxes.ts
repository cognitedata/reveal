/*!
 * Copyright 2022 Cognite AS
 */

import { Box3 } from 'three';

export function unionBoxes(boxes: Box3[], out?: Box3): Box3 {
  out = out ?? new Box3();
  out.makeEmpty();

  boxes.forEach(inputBox => {
    out!.expandByPoint(inputBox.max);
    out!.expandByPoint(inputBox.min);
  });

  return out;
}
