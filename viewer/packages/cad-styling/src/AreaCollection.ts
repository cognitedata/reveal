/*!
 * Copyright 2021 Cognite AS
 */

import { SmartMergeBoxes } from './mergeboxes/SmartMergeBoxes';
import { BoxClusterer } from './mergeboxes/BoxClusterer';

export interface AreaCollection {
  readonly isEmpty: boolean;
  areas(): Generator<THREE.Box3>;
  intersectsBox(box: THREE.Box3): boolean;

  addAreas(boxes: Iterable<THREE.Box3>): void;
  intersectWith(boxes: Iterable<THREE.Box3>): void;
}

export class SimpleAreaCollection implements AreaCollection {
  private _areas: THREE.Box3[] = [];

  addArea(area: THREE.Box3) {
    this._areas.push(area);
  }

  *areas(): Generator<THREE.Box3> {
    return this._areas;
  }

  get isEmpty(): boolean {
    return this._areas.length === 0;
  }

  intersectsBox(box: THREE.Box3): boolean {
    for (const area of this.areas()) {
      if (area.intersectsBox(box)) {
        return true;
      }
    }
    return false;
  }

  addAreas(inAreas: Iterable<THREE.Box3>): AreaCollection {
    for (const area of inAreas) {
      this._areas.push(area);
    }
    
    return this;
  }
  
  intersectWith(inAreas: Iterable<THREE.Box3>): AreaCollection {
    const newAreas: THREE.Box3[] = [];
    for (const inArea of inAreas) {
      for (const area of this._areas) {
        const intersection = inArea.clone().intersect(area);
        if (!intersection.isEmpty) {
          newAreas.push(intersection);
        }
      }
    }
    
    this._areas = newAreas;
    
    return this;
  }
}

/**
 * Convenience implementation to represent an empty collection of areas.
 * that can be shared among several instances.
 */
export class EmptyAreaCollection {
  private static _instance: EmptyAreaCollection | undefined;

  public static instance(): AreaCollection {
    EmptyAreaCollection._instance = EmptyAreaCollection._instance || new EmptyAreaCollection();
    return EmptyAreaCollection._instance;
  }

  private constructor() {}

  *areas(): Generator<THREE.Box3> {}

  intersectsBox(_box: THREE.Box3): boolean {
    return false;
  }

  addAreas(_: Iterable<THREE.Box3>): AreaCollection {
    throw new Error("addAreas() not defined for EmptyAreaCollection");
  }

  intersectWith(_: Iterable<THREE.Box3>): AreaCollection {
    throw new Error("intersectWith() not defined for EmptyAreaCollection");
  }

  get isEmpty(): boolean {
    return true;
  }
}

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

  addAreas(boxes: Iterable<THREE.Box3>): AreaCollection {
    this._clusterer.addBoxes(boxes);
    return this;
  }

  intersectWith(boxes: Iterable<THREE.Box3>): AreaCollection {
    this._clusterer.intersection(boxes);
    return this;
  }
};
