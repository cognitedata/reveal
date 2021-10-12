/*!
 * Copyright 2021 Cognite AS
 */

import { Box3 } from 'three';
import { MergingRTree } from './MergingRTree';

export class RTreeMergeBoxes {
  rtree: MergingRTree = new MergingRTree();

  addBoxes(boxes: Box3[]): void {
    for (const box of boxes) {
      this.rtree.insert(box);
    }
  }

  getBoxes(): Box3[] {
    return this.rtree.getBoxes();
  }
}
