/*!
 * Copyright 2022 Cognite AS
 */

import { ShapeType } from './ISerializableShape';
import { IShape } from './IShape';
import { SerializableCylinder } from './SerializableCylinder';

import { Box3, Matrix4, Vector3 } from 'three';

export class Cylinder implements IShape {
  private readonly _centerA: Vector3;
  private readonly _centerB: Vector3;
  private readonly _radius: number;

  constructor(centerA: Vector3, centerB: Vector3, radius: number) {
    this._centerA = centerA;
    this._centerB = centerB;
    this._radius = radius;
  }

  getSerializableShape(): SerializableCylinder {
    return {
      shapeType: ShapeType.Cylinder,
      centerA: this._centerA.toArray(),
      centerB: this._centerB.toArray(),
      radius: this._radius
    };
  }

  createBoundingBox(): Box3 {
    const middle = this._centerA.clone().add(this._centerB).multiplyScalar(0.5);
    const axisVec = middle.clone().sub(this._centerB);

    const axisOption0 = new Vector3(1, 0, 0);
    const axisOption1 = new Vector3(0, 1, 0);

    const chosenAxis =
      Math.abs(axisOption0.dot(axisVec)) < Math.abs(axisOption1.dot(axisVec)) ? axisOption0 : axisOption1;

    const perpVector0 = chosenAxis.clone().cross(axisVec).normalize().multiplyScalar(this._radius);
    const perpVector1 = perpVector0.clone().cross(axisVec).normalize().multiplyScalar(this._radius);

    const matrix = new Matrix4().makeBasis(axisVec, perpVector0, perpVector1);
    matrix.setPosition(middle);

    const baseBox = new Box3(new Vector3(-1, -1, -1), new Vector3(1, 1, 1));
    return baseBox.applyMatrix4(matrix);
  }
}
