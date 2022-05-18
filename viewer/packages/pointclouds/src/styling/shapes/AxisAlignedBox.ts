/*!
 * Copyright 2022 Cognite AS
 */

import { IShape } from './IShape';

// import * as THREE from 'three';

import { Vec3, AABB, b3ContainsPoint } from './linalg';

export type RawAxisAlignedBox = {
  type: 'aabb';
  box: AABB;
};

export class AxisAlignedBox implements IShape {
  private readonly _box: AABB;

  constructor(box: AABB) {
    this._box = box;
  }

  get min(): Vec3 {
    return this._box.min;
  }

  get max(): Vec3 {
    return this._box.max;
  }

  computeBoundingBox(): AABB {
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
