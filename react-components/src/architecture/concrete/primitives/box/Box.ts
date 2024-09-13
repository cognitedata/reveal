/*!
 * Copyright 2024 Cognite AS
 */

import { type Box3, Euler, Matrix4, Quaternion, Vector3 } from 'three';
import { radToDeg } from 'three/src/math/MathUtils.js';
import {
  forceAngleAround0,
  forceBetween0AndPi,
  forceBetween0AndTwoPi
} from '../../../base/utilities/extensions/mathExtensions';
import { BoxUtils } from '../../../base/utilities/geometry/BoxUtils';

export class Box {
  public static MIN_SIZE = 0.01;
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public readonly size = new Vector3().setScalar(Box.MIN_SIZE);
  public readonly center = new Vector3();
  public readonly rotation = new Euler(0, 0, 0, 'ZYX');

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get area(): number {
    return 2 * (this.size.x * this.size.y + this.size.y * this.size.z + this.size.z * this.size.x);
  }

  public get horizontalArea(): number {
    return this.size.x * this.size.y;
  }

  public get volume(): number {
    return this.size.x * this.size.y * this.size.z;
  }

  public get diagonal(): number {
    return this.size.length();
  }

  public get hasXYRotation(): boolean {
    return this.rotation.x !== 0 || this.rotation.y !== 0;
  }

  public get zRotationInDegrees(): number {
    const zRotation = this.hasXYRotation
      ? forceBetween0AndTwoPi(this.rotation.z)
      : forceBetween0AndPi(this.rotation.z);
    return radToDeg(zRotation);
  }

  // ==================================================
  // INSTANCE METHODS: Getters
  // ==================================================

  public getBoundingBox(): Box3 {
    return BoxUtils.getBoundingBox(this.getMatrix());
  }

  public getMatrix(matrix: Matrix4 = new Matrix4()): Matrix4 {
    return this.getScaledMatrix(this.size, matrix);
  }

  public getRotationMatrix(matrix: Matrix4 = new Matrix4()): Matrix4 {
    matrix.identity();
    matrix.makeRotationFromEuler(this.rotation);
    return matrix;
  }

  public getScaledMatrix(scale: Vector3, matrix: Matrix4 = new Matrix4()): Matrix4 {
    matrix.identity();
    matrix.makeRotationFromEuler(this.rotation);
    matrix.setPosition(this.center);
    matrix.scale(scale);
    return matrix;
  }

  public getRotationInDegrees(component: number): number {
    if (component === 0) {
      return radToDeg(forceAngleAround0(this.rotation.x));
    }
    if (component === 1) {
      return radToDeg(forceAngleAround0(this.rotation.y));
    }
    return this.zRotationInDegrees;
  }

  // ==================================================
  // INSTANCE METHODS: Setters
  // ==================================================

  public setMatrix(matrix: Matrix4): void {
    const quaternion = new Quaternion();
    matrix.decompose(this.center, quaternion, this.size);
    this.rotation.setFromQuaternion(quaternion, 'ZYX');
  }

  // ==================================================
  // INSTANCE METHODS: Operations
  // ==================================================

  public copy(box: Box): this {
    this.size.copy(box.size);
    this.center.copy(box.center);
    this.rotation.copy(box.rotation);
    return this;
  }

  public clear(): void {
    this.size.setScalar(Box.MIN_SIZE);
    this.center.setScalar(0);
    this.rotation.set(0, 0, 0, 'ZYX');
  }

  public forceMinSize(): void {
    const { size } = this;
    size.x = Math.max(Box.MIN_SIZE, size.x);
    size.y = Math.max(Box.MIN_SIZE, size.y);
    size.z = Math.max(Box.MIN_SIZE, size.z);
  }

  // ==================================================
  // STATIC METHODS:
  // ==================================================

  public static isValidSize(value: number): boolean {
    return value > Box.MIN_SIZE;
  }
}
