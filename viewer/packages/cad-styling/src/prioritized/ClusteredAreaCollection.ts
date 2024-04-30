/*!
 * Copyright 2021 Cognite AS
 */

import type { Box3 } from 'three';
import { AreaCollection } from './AreaCollection';
import { BoxClusterer } from './BoxClusterer';

/**
 * AreaCollection that stores a representative box set by merging
 * inserted boxes that are overlapping or close to each other.
 * It uses simple heuristics to determine which boxes are to be merged.
 */
export class ClusteredAreaCollection implements AreaCollection {
  private readonly _clusterer: BoxClusterer = new BoxClusterer();

  get isEmpty(): boolean {
    return this._clusterer.boxCount == 0;
  }

  *areas(): Generator<Box3> {
    yield* this._clusterer.getBoxes();
  }

  intersectsBox(box: Box3): boolean {
    for (const innerBox of this._clusterer.getBoxes()) {
      if (box.intersectsBox(innerBox)) {
        return true;
      }
    }

    return false;
  }

  addAreas(boxes: Iterable<Box3>): void {
    this._clusterer.addBoxes(boxes);
  }

  intersectWith(boxes: Iterable<Box3>): void {
    this._clusterer.intersection(boxes);
  }
}
