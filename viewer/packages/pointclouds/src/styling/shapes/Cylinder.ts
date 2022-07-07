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

  createBoundingBox(): THREE.Box3 {
    const axisVec = this.getMiddle().sub(this._centerB);

    const axisOption0 = new THREE.Vector3(1, 0, 0);
    const axisOption1 = new THREE.Vector3(0, 1, 0);

    const chosenAxis =
      Math.abs(axisOption0.dot(axisVec)) < Math.abs(axisOption1.dot(axisVec)) ? axisOption0 : axisOption1;

    const perpVector0 = chosenAxis.clone().cross(axisVec).multiplyScalar(this.radius);
    const perpVector1 = perpVector0.clone().cross(axisVec).multiplyScalar(this.radius);

    const matrix = new THREE.Matrix4().makeBasis(axisVec, perpVector0, perpVector1);
    matrix.setPosition(this.getMiddle());

    const baseBox = new THREE.Box3(new THREE.Vector3(-1, -1, -1), new THREE.Vector3(1, 1, 1));
    return baseBox.applyMatrix4(matrix);
  }
}
