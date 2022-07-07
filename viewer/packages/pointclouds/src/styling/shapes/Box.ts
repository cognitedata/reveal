/*!
 * Copyright 2022 Cognite AS
 */

import { ShapeType } from './IRawShape';
import { IShape } from './IShape';
import { Mat4 } from './linalg';

import * as THREE from 'three';

export type RawBox = {
  type: ShapeType.Box;
  invMatrix: Mat4;
};

export class Box implements IShape {
  readonly invMatrix: THREE.Matrix4;

  constructor(invertedInstanceMatrix: THREE.Matrix4) {
    this.invMatrix = invertedInstanceMatrix.clone();
  }

  containsPoint(point: THREE.Vector3): boolean {
    const transformedPoint = point.clone().applyMatrix4(this.invMatrix);

    return (
      Math.max(Math.abs(transformedPoint.x), Math.max(Math.abs(transformedPoint.y), Math.abs(transformedPoint.z))) <=
      0.5
    );
  }

  toRawShape(): RawBox {
    return {
      type: ShapeType.Box,
      invMatrix: { data: this.invMatrix.clone().transpose().toArray() }
    };
  }
}
