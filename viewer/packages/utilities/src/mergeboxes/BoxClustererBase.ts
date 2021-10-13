/*!
 * Copyright 2021 Cognite AS
 */

import { Box3 } from 'three';

export interface BoxClustererBase<T> {
  addBoxes: (boxes: Box3[]) => void;

  getBoxes: () => Box3[];

  getValue: () => T;

  union: (otherClusterer: BoxClustererBase<T>) => BoxClustererBase<T>;
  intersection: (otherClusterer: BoxClustererBase<T>) => BoxClustererBase<T>;
}
