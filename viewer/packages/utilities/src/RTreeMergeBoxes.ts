/*!
 * Copyright 2021 Cognite AS
 */

import { Box3 } from 'three';
import { RTree } from './RTree';

export class RTreeMergeBoxes {
  rtree: RTree = new RTree();

  addBoxes(boxes: Box3[]): void {
    for (const box of boxes) {
      this.rtree.insert(box);
    }
  }

  getBoxes(): Box3[] {
    return this.rtree.getBoxes();
  }
}
