/*!
 * Copyright 2021 Cognite AS
 */

import { Box3 } from 'three';

export interface BoxClusterer {
  get boxCount(): number;

  addBoxes(boxes: Iterable<Box3>): void;

  getBoxes(): Generator<Box3>;
  intersectsBox(box: Box3): boolean;

  union(boxes: Iterable<Box3>): BoxClusterer;
  intersection(boxes: Iterable<Box3>): BoxClusterer;
}
