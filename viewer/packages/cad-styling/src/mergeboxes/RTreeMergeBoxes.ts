/*!
 * Copyright 2021 Cognite AS
 */

import { Box3 } from 'three';
import { BoxClusterer } from './BoxClusterer';
import { MergingRTree } from './MergingRTree';

export class RTreeMergeBoxes implements BoxClusterer {
  private readonly _rtree: MergingRTree;

  constructor(rtree: MergingRTree);
  constructor();
  constructor(rtree?: MergingRTree) {
    this._rtree = rtree ?? new MergingRTree();
  }

  get boxCount(): number {
    return this._rtree?.getSize() ?? 0;
  }

  addBoxes(boxes: Iterable<Box3>): void {
    for (const box of boxes) {
      this._rtree.insert(box);
    }
  }

  *getBoxes(): Generator<Box3> {
    yield* this._rtree.getBoxes();
  }

  union(otherRtree: Iterable<Box3>): BoxClusterer {
    if (!(otherRtree instanceof RTreeMergeBoxes)) {
      throw Error('Expected RTreeMergeBoxes in union operation');
    }

    return new RTreeMergeBoxes(this._rtree.union(otherRtree._rtree.getBoxes()));
  }

  intersection(otherRtree: Iterable<Box3>): BoxClusterer {
    if (!(otherRtree instanceof RTreeMergeBoxes)) {
      throw Error('Expected RTreeMergeBoxes in intersection operation');
    }
    return new RTreeMergeBoxes(this._rtree.intersection(otherRtree._rtree));
  }

  intersectsBox(box: Box3): boolean {
    return this._rtree.intersectsBox(box);
  }
}
