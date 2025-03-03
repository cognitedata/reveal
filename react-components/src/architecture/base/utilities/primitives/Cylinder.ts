/*!
 * Copyright 2024 Cognite AS
 */

import { type Box3, Matrix4, Quaternion, type Ray, Vector3 } from 'three';
import { Range3 } from '../geometry/Range3';
import { square } from '../extensions/mathExtensions';
import { Primitive } from './Primitive';
import { PrimitiveType } from './PrimitiveType';

const UP_AXIS = new Vector3(0, 0, 1);

export class Cylinder extends Primitive {
  public static MinSize = 0.01;

  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public radius = Cylinder.MinSize;
  public readonly centerA = new Vector3(0, 0, -Cylinder.MinSize);
  public readonly centerB = new Vector3(0, 0, +Cylinder.MinSize);

  // Redundant variable, calculated when needed
  private readonly _center = new Vector3();
  private readonly _axis = new Vector3();
  private readonly _size = new Vector3();

  public get endCapArea(): number {
    return Math.PI * this.radius * this.radius;
  }

  // ==================================================
  // OVERRIDES of Primitive
  // ==================================================

  public override get primitiveType(): PrimitiveType {
    return PrimitiveType.Cylinder;
  }

  public override get area(): number {
    return 2 * Math.PI * this.radius * this.height + 2 * this.endCapArea;
  }

  public override get volume(): number {
    return Math.PI * square(this.radius) * this.height;
  }

  public override get diagonal(): number {
    return Math.sqrt(square(this.radius) + square(this.height));
  }

  public override getMatrix(): Matrix4 {
    return new Matrix4().compose(this.center, this.getQuaternion(), this.size);
  }

  public override setMatrix(matrix: Matrix4): void {
    const centerA = new Vector3(0, 0, -0.5).applyMatrix4(matrix);
    const centerB = new Vector3(0, 0, 0.5).applyMatrix4(matrix);
    const scale = new Vector3();
    matrix.decompose(new Vector3(), new Quaternion(), scale);

    this.centerA.copy(centerA);
    this.centerB.copy(centerB);
    this.radius = scale.x / 2;
  }

  public override expandBoundingBox(boundingBox: Box3): void {
    const range = new Range3(this.centerA, this.centerB);
    range.expandByMargin3(Range3.getCircleRangeMargin(this.axis, this.radius));
    boundingBox.union(range.getBox());
  }

  public override isPointInside(point: Vector3, globalMatrix: Matrix4): boolean {
    const { centerA, centerB } = this.getCenters(globalMatrix);
    const center = new Vector3().addVectors(centerA, centerB).divideScalar(2);
    const vector = centerA.sub(centerB);
    const height = vector.length();
    vector.normalize();

    const diff = center.sub(point);
    const dot = vector.dot(diff);
    vector.multiplyScalar(dot);
    vector.sub(diff);

    const distanceToAxis = vector.length();
    // Check distance to axis
    if (distanceToAxis > this.radius) {
      return false;
    }
    // Check if it is inside along axis
    if (Math.abs(dot) > height / 2) {
      return false;
    }
    return true;
  }

  public override intersectRay(ray: Ray, globalMatrix: Matrix4): Vector3 | undefined {
    const { centerA, centerB } = this.getCenters(globalMatrix);
    const { radius } = this;
    const rayOrigin = ray.origin;
    const rayDirection = ray.direction;
    const ba = new Vector3().subVectors(centerB, centerA);
    const baRd = ba.dot(rayDirection);

    // Inspired by : https://github.com/nhocki/Ray-Tracer/blob/master/objects/Cylinder.cpp
    // Check the intersection with cap A
    if (baRd > 0) {
      const baCa = ba.dot(centerA);
      const t = (baCa - ba.dot(rayOrigin)) / baRd;
      const intersection = ray.at(t, new Vector3());
      if (intersection.distanceTo(centerA) <= radius) {
        return intersection;
      }
    }
    // Check the intersection with cap B
    if (baRd < 0) {
      const baCb = ba.dot(centerB);
      const t = (baCb - ba.dot(rayOrigin)) / baRd;
      const intersection = ray.at(t, new Vector3());
      if (intersection.distanceTo(centerB) <= radius) {
        return intersection;
      }
    }
    // Body
    const oc = new Vector3().subVectors(rayOrigin, centerA);
    const baBa = ba.dot(ba);
    const baOc = ba.dot(oc);
    const k2 = baBa - baRd * baRd;
    const k1 = baBa * oc.dot(rayDirection) - baOc * baRd;
    const k0 = baBa * oc.dot(oc) - baOc * baOc - radius * radius * baBa;
    const discriminant = k1 * k1 - k2 * k0;
    if (discriminant < 0.0) {
      return undefined;
    }
    const sqrtH = Math.sqrt(discriminant);
    const t = (-k1 - sqrtH) / k2;
    const y = baOc + t * baRd;
    if (y > 0.0 && y < baBa) {
      return ray.at(t, new Vector3());
    }
    return undefined;
  }

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get height(): number {
    return this.centerA.distanceTo(this.centerB);
  }

  public get center(): Vector3 {
    return this._center.addVectors(this.centerB, this.centerA).divideScalar(2);
  }

  public get size(): Vector3 {
    return this._size.set(this.diameter, this.diameter, this.height);
  }

  public get axis(): Vector3 {
    return this._axis.subVectors(this.centerB, this.centerA).normalize();
  }

  public get diameter(): number {
    return 2 * this.radius;
  }

  // ==================================================
  // INSTANCE METHODS: Getters
  // ==================================================

  public getRotationMatrix(matrix: Matrix4 = new Matrix4()): Matrix4 {
    matrix.identity();
    return matrix.makeRotationFromQuaternion(this.getQuaternion());
  }

  public getScaledMatrix(scale: Vector3, matrix: Matrix4 = new Matrix4()): Matrix4 {
    return matrix.compose(this.center, this.getQuaternion(), scale);
  }

  public getQuaternion(): Quaternion {
    const quaternion = new Quaternion();
    return quaternion.setFromUnitVectors(UP_AXIS, this.axis);
  }

  private getCenters(globalMatrix: Matrix4): { centerA: Vector3; centerB: Vector3 } {
    const centerA = this.centerA.clone();
    const centerB = this.centerB.clone();
    centerA.applyMatrix4(globalMatrix);
    centerB.applyMatrix4(globalMatrix);
    return { centerA, centerB };
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
    this.radius = Cylinder.MinSize;
    this.centerA.set(0, 0, -Cylinder.MinSize);
    this.centerB.set(0, 0, +Cylinder.MinSize);
  }

  public forceMinSize(): void {
    this.radius = Math.max(this.radius, Cylinder.MinSize);
  }

  // ==================================================
  // STATIC METHODS:
  // ==================================================

  public static isValidSize(value: number): boolean {
    return value > Cylinder.MinSize;
  }
}
