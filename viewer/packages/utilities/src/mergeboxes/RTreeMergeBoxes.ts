/*!
 * Copyright 2021 Cognite AS
 */

import { Box3 } from 'three';
import { BoxClustererBase } from './BoxClustererBase';
import { MergingRTree } from './MergingRTree';

export class RTreeMergeBoxes implements BoxClustererBase {
  private readonly rtree: MergingRTree;

  constructor(rtree: MergingRTree);
  constructor();
  constructor(rtree?: MergingRTree) {
    this.rtree = rtree ?? new MergingRTree();
  }

  addBoxes(boxes: Box3[]): void {
    for (const box of boxes) {
      this.rtree.insert(box);
    }
  }

  *getBoxes(): Generator<Box3> {
    yield* this.rtree.getBoxes();
  }

  union(otherRtree: BoxClustererBase): BoxClustererBase {
    if (!(otherRtree instanceof RTreeMergeBoxes)) {
      throw Error('Expected RTreeMergeBoxes in union operation');
    }

    return new RTreeMergeBoxes(this.rtree.union(otherRtree.rtree));
  }

  intersection(otherRtree: BoxClustererBase): BoxClustererBase {
    if (!(otherRtree instanceof RTreeMergeBoxes)) {
      throw Error('Expected RTreeMergeBoxes in intersection operation');
    }
    return new RTreeMergeBoxes(this.rtree.intersection(otherRtree.rtree));
  }
}
