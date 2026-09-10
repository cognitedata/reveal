/*!
 * Copyright 2022 Cognite AS
 */

import type { Matrix4 } from 'three';
import { Box3, Vector3 } from 'three';

import { ShapeType } from './ISerializableShape';
import type { IShape } from './IShape';
import type { SerializableBox } from './SerializableBox';

export class Box implements IShape {
  private readonly _invInstanceMatrix: Matrix4;

  constructor(instanceMatrix: Matrix4) {
    this._invInstanceMatrix = instanceMatrix.invert();
  }

  getSerializableShape(): SerializableBox {
    return {
      shapeType: ShapeType.Box,
      invMatrix: { data: this._invInstanceMatrix.toArray() }
    };
  }

  createBoundingBox(): Box3 {
    const baseBox = new Box3(new Vector3(-1.0, -1.0, -1.0), new Vector3(1.0, 1.0, 1.0));
    const instanceMatrix = this._invInstanceMatrix.clone().invert();

    return baseBox.applyMatrix4(instanceMatrix);
  }
}
