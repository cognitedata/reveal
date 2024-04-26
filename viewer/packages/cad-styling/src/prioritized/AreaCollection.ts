/*!
 * Copyright 2021 Cognite AS
 */

import type { Box3 } from 'three';

/**
 * Represents a collection of areas/axis-aligned
 * bounding boxes for use e.g. for load prioritization. Implementations
 * are not expected to store all areas inserted with `addAreas`,
 * but rather some "representative box set" covering the inserted areas.
 * Performance will be better the fewer boxes the representative set contains,
 * while the effectiveness of node prioritization will suffer if the
 * representative set covers too much area that is not part
 * of the inserted boxes
 */
export interface AreaCollection {
  readonly isEmpty: boolean;

  /**
   * Return some set of boxes that cover the boxes inserted with `addAreas`.
   * It is required that each inserted box is completely covered by some
   * subset of boxes in the set returned from `areas`
   */
  areas(): Generator<Box3>;

  /**
   * Return whether the input box intersects the AreaCollection.
   */
  intersectsBox(box: Box3): boolean;

  /**
   * Add areas to be covered by the representative set of this
   * AreaCollection.
   */
  addAreas(boxes: Iterable<Box3>): void;

  /**
   * Alter the representative set to cover only the intersection between the
   * representative set of this AreaCollection and the incoming boxes.
   * Note that the intersection of two representative sets A' and B' that
   * represent the original box sets A and B will cover the intersection between
   * A and B, and will thus be a valid representative set for the intersection of A and B.
   */
  intersectWith(boxes: Iterable<Box3>): void;
}
