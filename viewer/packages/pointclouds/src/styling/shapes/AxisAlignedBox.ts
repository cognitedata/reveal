/*!
 * Copyright 2022 Cognite AS
 */

import { IShape } from './IShape';

// import * as THREE from 'three';

import { Vec3, Box3, b3ContainsPoint } from './linalg';

export type RawAxisAlignedBox = {
  type: 'aabb';
  box: Box3;
};

export class AxisAlignedBox implements IShape {
  private readonly _box: Box3;

  constructor(box: Box3) {
    this._box = box;
  }

  get min(): Vec3 {
    return this._box.min;
  }

  get max(): Vec3 {
    return this._box.max;
  }

  computeBoundingBox(): Box3 {
    return this._box;
  }

  containsPoint(point: Vec3): boolean {
    return b3ContainsPoint(this._box, point);
  }

  toRawShape(): RawAxisAlignedBox {
    return {
      type: 'aabb',
      box: this._box
    };
  }
}
