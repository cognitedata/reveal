/*!
 * Copyright 2022 Cognite AS
 */

import { ShapeType } from './IRawShape';
import { IShape } from './IShape';
import { m4MultiplyV3WithTranslation, Mat4, Vec3 } from './linalg';

export type RawBox = {
  type: ShapeType.Box;
  invMatrix: Mat4;
};

export class Box implements IShape {
  readonly invMatrix: Mat4;

  constructor(invertedInstanceMatrix: Mat4) {
    this.invMatrix = invertedInstanceMatrix;
  }

  containsPoint(point: Vec3): boolean {
    const transformedPoint = m4MultiplyV3WithTranslation(this.invMatrix, point);

    return (
      Math.max(Math.abs(transformedPoint[0]), Math.max(Math.abs(transformedPoint[1]), Math.abs(transformedPoint[2]))) <=
      0.5
    );
  }

  toRawShape(): RawBox {
    return {
      type: ShapeType.Box,
      invMatrix: this.invMatrix
    };
  }
}
