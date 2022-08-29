/*!
 * Copyright 2022 Cognite AS
 */

import { ShapeType } from './IRawShape';
import { IShape } from './IShape';

import { Vec3, v3Scale, v3Middle, v3Length, v3Sub, v3Normalized, v3Dot } from './linalg';

export type RawCylinder = {
  type: ShapeType.Cylinder;
  centerA: Vec3;
  centerB: Vec3;
  radius: number;
};

export class Cylinder implements IShape {
  private readonly _centerA: Vec3;
  private readonly _centerB: Vec3;
  private readonly _radius: number;

  constructor(centerA: Vec3, centerB: Vec3, radius: number) {
    this._centerA = centerA;
    this._centerB = centerB;
    this._radius = radius;
  }

  get centerA(): Vec3 {
    return this._centerA;
  }

  get centerB(): Vec3 {
    return this._centerB;
  }

  get radius(): number {
    return this._radius;
  }

  private getHalfHeight(): number {
    return v3Length(v3Sub(this._centerA, this._centerB));
  }

  private getMiddle(): Vec3 {
    return v3Middle(this._centerA, this._centerB);
  }

  private getAxis(): Vec3 {
    return v3Normalized(v3Sub(this._centerA, this._centerB));
  }

  containsPoint(point: Vec3): boolean {
    const halfHeight = this.getHalfHeight();
    const middle = this.getMiddle();
    const dir = this.getAxis();
    const distAlongAxis = v3Dot(v3Sub(point, middle), dir);
    const axisRelativeMiddle = v3Sub(point, v3Scale(dir, distAlongAxis));

    const distToAxis = v3Length(v3Sub(axisRelativeMiddle, middle));

    return Math.abs(distAlongAxis) < halfHeight && distToAxis < this._radius;
  }

  toRawShape(): RawCylinder {
    return {
      type: ShapeType.Cylinder,
      centerA: this._centerA,
      centerB: this._centerB,
      radius: this._radius
    };
  }
}
