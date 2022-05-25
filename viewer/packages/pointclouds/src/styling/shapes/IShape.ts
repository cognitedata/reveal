/*!
 * Copyright 2022 Cognite AS
 */

import { IRawShape } from './IRawShape';

import { Vec3, AABB } from './linalg';

export interface IShape {
  /**
   * Returns a bounding box containing the shape.
   * May be just a crude approximation, but is guaranteed to contain the entire shape
   */
  computeBoundingBox(): AABB;

  containsPoint(point: Vec3): boolean;

  toRawShape(): IRawShape;
}
