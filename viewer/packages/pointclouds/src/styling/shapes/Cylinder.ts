/*!
 * Copyright 2022 Cognite AS
 */

import { ShapeType } from './IRawShape';
import { IShape } from './IShape';

import { Vec3 } from './linalg';

import * as THREE from 'three';

export type RawCylinder = {
  type: ShapeType.Cylinder;
  centerA: Vec3;
  centerB: Vec3;
  radius: number;
};

export class Cylinder implements IShape {
  private readonly _centerA: THREE.Vector3;
  private readonly _centerB: THREE.Vector3;
  private readonly _radius: number;

  constructor(centerA: THREE.Vector3, centerB: THREE.Vector3, radius: number) {
    this._centerA = centerA;
    this._centerB = centerB;
    this._radius = radius;
  }

  get centerA(): THREE.Vector3 {
    return this._centerA;
  }

  get centerB(): THREE.Vector3 {
    return this._centerB;
  }

  get radius(): number {
    return this._radius;
  }

  private getHalfHeight(): number {
    return this._centerA.clone().sub(this._centerB).length() * 0.5;
  }

  private getMiddle(): THREE.Vector3 {
    return this._centerA.clone().add(this._centerB).multiplyScalar(0.5);
  }

  private getAxis(): THREE.Vector3 {
    return this._centerA.clone().sub(this._centerB).normalize();
  }

  containsPoint(point: THREE.Vector3): boolean {
    const halfHeight = this.getHalfHeight();
    const middle = this.getMiddle();
    const dir = this.getAxis();

    const distAlongAxis = point.clone().sub(middle).dot(dir);
    const axisRelativeMiddle = point.clone().sub(dir.clone().multiplyScalar(distAlongAxis));

    const distToAxis = axisRelativeMiddle.clone().sub(middle).length();

    return Math.abs(distAlongAxis) < halfHeight && distToAxis < this._radius;
  }

  toRawShape(): RawCylinder {
    return {
      type: ShapeType.Cylinder,
      centerA: this._centerA.toArray(),
      centerB: this._centerB.toArray(),
      radius: this._radius
    };
  }
}
