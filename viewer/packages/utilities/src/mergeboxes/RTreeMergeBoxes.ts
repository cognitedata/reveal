/*!
 * Copyright 2021 Cognite AS
 */

import { Box3 } from 'three';
import { BoxClustererBase } from './BoxClustererBase';
import { MergingRTree } from './MergingRTree';

export class RTreeMergeBoxes implements BoxClustererBase<RTreeMergeBoxes> {
  private rtree: MergingRTree;

  constructor(rtree: MergingRTree);
  constructor();
  constructor(rtree: MergingRTree | undefined = undefined) {
    if (rtree) {
      this.rtree = rtree;
    } else {
      this.rtree = new MergingRTree();
    }
  }

  addBoxes(boxes: Box3[]): void {
    for (const box of boxes) {
      this.rtree.insert(box);
    }
  }

  getBoxes(): Box3[] {
    return this.rtree.getBoxes();
  }

  union(otherRtree: BoxClustererBase<RTreeMergeBoxes>): BoxClustererBase<RTreeMergeBoxes> {
    return new RTreeMergeBoxes(this.rtree.union(otherRtree.getWrappedInstance().rtree));
  }

  intersection(otherRtree: BoxClustererBase<RTreeMergeBoxes>): BoxClustererBase<RTreeMergeBoxes> {
    return new RTreeMergeBoxes(this.rtree.intersection(otherRtree.getWrappedInstance().rtree));
  }

  getWrappedInstance() {
    return this;
  }
}
