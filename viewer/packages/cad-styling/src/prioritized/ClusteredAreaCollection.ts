/*!
 * Copyright 2021 Cognite AS
 */

import { AreaCollection } from './AreaCollection';
import { SmartMergeBoxes } from './mergeboxes/SmartMergeBoxes';
import { BoxClusterer } from './mergeboxes/BoxClusterer';

/**
 * AreaCollection based on a BoxClusterer implementation
 * BoxClusterer will probably be obsolete in the not-too-distant future
 */
export class ClusteredAreaCollection implements AreaCollection {
  private _clusterer: BoxClusterer = new SmartMergeBoxes();

  get isEmpty(): boolean {
    return this._clusterer.boxCount == 0;
  }

  *areas(): Generator<THREE.Box3> {
    yield* this._clusterer.getBoxes();
  }

  intersectsBox(box: THREE.Box3): boolean {
    for (const innerBox of this._clusterer.getBoxes()) {
      if (box.intersectsBox(innerBox)) {
        return true;
      }
    }

    return false;
  }

  addAreas(boxes: Iterable<THREE.Box3>): void {
    this._clusterer.addBoxes(boxes);
  }

  intersectWith(boxes: Iterable<THREE.Box3>): void {
    this._clusterer.intersection(boxes);
  }
}
