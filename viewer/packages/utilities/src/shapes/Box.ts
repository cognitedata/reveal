/*!
 * Copyright 2022 Cognite AS
 */

import { Matrix4, Box3, Vector3 } from 'three';

import { ShapeType } from './ISerializableShape';
import { IShape } from './IShape';
import { SerializableBox } from './SerializableBox';

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
    const baseBox = new Box3(new Vector3(-0.5, -0.5, -0.5), new Vector3(0.5, 0.5, 0.5));
    const instanceMatrix = this._invInstanceMatrix.invert();

    return baseBox.applyMatrix4(instanceMatrix);
  }
}
