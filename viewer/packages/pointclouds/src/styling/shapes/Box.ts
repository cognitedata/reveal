/*!
 * Copyright 2022 Cognite AS
 */

import { ShapeType } from './IRawShape';
import { IShape } from './IShape';
import {
  AABB,
  createInvertedRevealTransformationFromCdfTransformation,
  m4MultiplyV3WithTranslation,
  Mat4,
  Vec3
} from './linalg';

export type RawBox = {
  type: ShapeType.Box;
  invMatrix: Mat4;
};

export class Box implements IShape {
  readonly invMatrix: Mat4;

  constructor(instanceMatrix: number[], alreadyInverted: boolean = false) {
    if (alreadyInverted) {
      this.invMatrix = { data: instanceMatrix.slice() };
    } else {
      const mat: Mat4 = { data: instanceMatrix };
      this.invMatrix = createInvertedRevealTransformationFromCdfTransformation(mat);
    }
  }

  computeBoundingBox(): AABB {
    throw Error('Bounding box not implemented for box primitive');
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
