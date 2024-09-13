/*!
 * Copyright 2024 Cognite AS
 */

import { type Box3, Matrix4, Quaternion, Vector3 } from 'three';
import { Range3 } from '../../../base/utilities/geometry/Range3';
import { square } from '../../../base/utilities/extensions/mathExtensions';

const UP_AXIS = new Vector3(0, 0, 1);

export class Cylinder {
  public static MIN_SIZE = 0.01;

  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public radius = Cylinder.MIN_SIZE;
  public readonly centerA = new Vector3(0, 0, -Cylinder.MIN_SIZE);
  public readonly centerB = new Vector3(0, 0, +Cylinder.MIN_SIZE);

  // Redundant variable, calculated when needed
  private readonly _center = new Vector3();
  private readonly _axis = new Vector3();

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get height(): number {
    return this.centerA.distanceTo(this.centerB);
  }

  public get center(): Vector3 {
    return this._center.addVectors(this.centerB, this.centerA).divideScalar(2);
  }

  public get axis(): Vector3 {
    return this._axis.subVectors(this.centerB, this.centerA).normalize();
  }

  public get area(): number {
    return 2 * Math.PI * this.radius * this.height;
  }

  public get volume(): number {
    return Math.PI * square(this.radius) * this.height;
  }

  // ==================================================
  // INSTANCE METHODS: Getters
  // ==================================================

  public getBoundingBox(): Box3 {
    const range = new Range3(this.centerA, this.centerB);
    range.expandByMargin3(Range3.getCircleRangeMargin(this.axis, this.radius));
    return range.getBox();
  }

  public getMatrix(matrix: Matrix4 = new Matrix4()): Matrix4 {
    const scale = new Vector3(this.radius * 2, this.radius * 2, this.height);
    const quaternion = new Quaternion();
    quaternion.setFromUnitVectors(UP_AXIS, this.axis);
    matrix.compose(this.center, quaternion, scale);
    return matrix;
  }

  public getRotationMatrix(matrix: Matrix4 = new Matrix4()): Matrix4 {
    const quaternion = new Quaternion();
    quaternion.setFromUnitVectors(UP_AXIS, this.axis);
    matrix.makeRotationFromQuaternion(quaternion);
    return matrix;
  }

  public getScaledMatrix(scale: Vector3, matrix: Matrix4 = new Matrix4()): Matrix4 {
    const quaternion = new Quaternion();
    quaternion.setFromUnitVectors(UP_AXIS, this.axis);
    matrix.compose(this.center, quaternion, scale);
    return matrix;
  }

  // ==================================================
  // INSTANCE METHODS: Setters
  // ==================================================

  public setMatrix(matrix: Matrix4): void {
    const centerA = new Vector3(0, 0, -0.5).applyMatrix4(matrix);
    const centerB = new Vector3(0, 0, 0.5).applyMatrix4(matrix);
    const scale = new Vector3();
    matrix.decompose(new Vector3(), new Quaternion(), scale);

    this.centerA.copy(centerA);
    this.centerB.copy(centerB);
    this.radius = scale.x / 2;
  }

  // ==================================================
  // INSTANCE METHODS: Operations
  // ==================================================

  public copy(cylinder: Cylinder): this {
    this.radius = cylinder.radius;
    this.centerA.copy(cylinder.centerA);
    this.centerB.copy(cylinder.centerB);
    return this;
  }

  public clear(): void {
    this.radius = Cylinder.MIN_SIZE;
    this.centerA.set(0, 0, -Cylinder.MIN_SIZE);
    this.centerB.set(0, 0, +Cylinder.MIN_SIZE);
  }

  public forceMinSize(): void {
    this.radius = Math.max(this.radius, Cylinder.MIN_SIZE);
  }

  // ==================================================
  // STATIC METHODS:
  // ==================================================

  public static isValidSize(value: number): boolean {
    return value > Cylinder.MIN_SIZE;
  }
}
