/*!
 * Copyright 2022 Cognite AS
 */

// import * as THREE from 'three';

import { IRawShape } from './IRawShape';

import { Vec3, Box3 } from './linalg';

export interface IShape {
  /**
   * Returns a bounding box containing the shape.
   * May be just a crude approximation, but is guaranteed to contain the entire shape
   */
  computeBoundingBox(): Box3;

  containsPoint(point: Vec3): boolean;

  toRawShape(): IRawShape;
}
