/*!
 * Copyright 2021 Cognite AS
 */

import { Box3 } from 'three';

export interface BoxClusterer {
  addBoxes(boxes: Iterable<Box3>): void;

  getBoxes(): Generator<Box3>;

  union(otherClusterer: BoxClusterer): BoxClusterer;
  intersection(otherClusterer: BoxClusterer): BoxClusterer;
}
