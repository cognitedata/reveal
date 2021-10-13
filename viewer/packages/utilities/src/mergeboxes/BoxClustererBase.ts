/*!
 * Copyright 2021 Cognite AS
 */

import { Box3 } from 'three';

export interface BoxClustererBase {
  addBoxes: (boxes: Iterable<Box3>) => void;

  getBoxes: () => Generator<Box3>;

  union: (otherClusterer: BoxClustererBase) => BoxClustererBase;
  intersection: (otherClusterer: BoxClustererBase) => BoxClustererBase;
}
