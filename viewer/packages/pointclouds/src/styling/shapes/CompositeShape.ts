/*!
 * Copyright 2022 Cognite AS
 */

import { IShape } from './IShape';
import { IRawShape } from './IRawShape';

// import * as THREE from 'three';
import { Vec3, Box3, b3Union, emptyBox3 } from './linalg';

export type RawCompositeShape = {
  type: 'composite';
  shapes: IRawShape[];
};

export class CompositeShape implements IShape {
  private readonly _innerShapes: IShape[];

  constructor(shapes: IShape[]) {
    this._innerShapes = shapes.slice();
  }

  computeBoundingBox(): Box3 {
    let newBox = emptyBox3();
    for (const shape of this._innerShapes) {
      newBox = b3Union(newBox, shape.computeBoundingBox());
    }
    return newBox;
  }

  containsPoint(point: Vec3): boolean {
    for (const shape of this._innerShapes) {
      if (shape.containsPoint(point)) {
        return true;
      }
    }

    return false;
  }

  toRawShape(): RawCompositeShape {
    return {
      type: 'composite',
      shapes: this._innerShapes.map(shape => shape.toRawShape())
    };
  }
}
