/*!
 * Copyright 2021 Cognite AS
 */

import type { Box3 } from 'three';
import { AreaCollection } from './AreaCollection';

/**
 * Convenience implementation to represent an empty collection of areas.
 * that can be shared among several instances.
 */
export class EmptyAreaCollection implements AreaCollection {
  private static _instance: EmptyAreaCollection | undefined;

  public static instance(): AreaCollection {
    EmptyAreaCollection._instance = EmptyAreaCollection._instance || new EmptyAreaCollection();
    return EmptyAreaCollection._instance;
  }

  private constructor() {}

  *areas(): Generator<Box3> {}

  intersectsBox(_box: Box3): boolean {
    return false;
  }

  addAreas(_: Iterable<Box3>): void {
    throw new Error('addAreas() not defined for EmptyAreaCollection');
  }

  intersectWith(_: Iterable<Box3>): void {}

  get isEmpty(): boolean {
    return true;
  }
}
