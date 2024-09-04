/*!
 * Copyright 2024 Cognite AS
 */

import { type Vector2, Vector3, Box3, type Plane, Line3 } from 'three';
import { Range1 } from './Range1';
import { square } from '../extensions/mathExtensions';
import { Vector3Pool } from '@cognite/reveal';

export class Range3 {
  // ==================================================
  // STATIC FIELDS
  // ==================================================

  public static readonly empty = new Range3();

  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public x: Range1 = new Range1();
  public y: Range1 = new Range1();
  public z: Range1 = new Range1();

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get isEmpty(): boolean {
    return this.x.isEmpty || this.y.isEmpty || this.z.isEmpty;
  }

  public get min(): Vector3 {
    return new Vector3(this.x.min, this.y.min, this.z.min);
  }

  public get max(): Vector3 {
    return new Vector3(this.x.max, this.y.max, this.z.max);
  }

  public get delta(): Vector3 {
    return new Vector3(this.x.delta, this.y.delta, this.z.delta);
  }

  public get center(): Vector3 {
    return new Vector3(this.x.center, this.y.center, this.z.center);
  }

  public get diagonal(): number {
    return Math.sqrt(square(this.x.delta) + square(this.y.delta) + square(this.z.delta));
  }

  public get area(): number {
    return 2 * (this.x.delta + this.y.delta + this.z.delta);
  }

  public get volume(): number {
    return this.x.delta * this.y.delta * this.z.delta;
  }

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(min?: Vector3, max?: Vector3) {
    if (min === undefined && max !== undefined) {
      this.set(max, max);
    } else if (min !== undefined && max === undefined) {
      this.set(min, min);
    } else if (min !== undefined && max !== undefined) {
      this.set(min, max);
    }
  }

  public clone(): Range3 {
    const range = new Range3();
    range.x = this.x.clone();
    range.y = this.y.clone();
    range.z = this.z.clone();
    return range;
  }

  // ==================================================
  // INSTANCE METHODS: Requests
  // ==================================================

  public equals(other: Range3 | undefined): boolean {
    if (other === undefined) {
      return false;
    }
    return this.x.equals(other.x) && this.y.equals(other.y) && this.z.equals(other.z);
  }

  public isInside(point: Vector3): boolean {
    return this.x.isInside(point.x) && this.y.isInside(point.y) && this.z.isInside(point.z);
  }

  // ==================================================
  // INSTANCE METHODS: Getters
  // ==================================================

  public toString(): string {
    return `(X: ${this.x.toString()}, Y: ${this.y.toString()}, Z: ${this.z.toString()})`;
  }

  public getMin(target: Vector3): Vector3 {
    return target.set(this.x.min, this.y.min, this.z.min);
  }

  public getMax(target: Vector3): Vector3 {
    return target.set(this.x.max, this.y.max, this.z.max);
  }

  public getDelta(target: Vector3): Vector3 {
    return target.set(this.x.delta, this.y.delta, this.z.delta);
  }

  public getCenter(target: Vector3): Vector3 {
    return target.set(this.x.center, this.y.center, this.z.center);
  }

  public getBox(target?: Box3): Box3 {
    if (target === undefined) {
      target = new Box3();
    }
    target.min.set(this.x.min, this.y.min, this.z.min);
    target.max.set(this.x.max, this.y.max, this.z.max);
    return target;
  }

  public getCornerPoints(corners: Vector3[]): Vector3[] {
    for (let corner = 0; corner < 8; corner++) {
      this.getCornerPoint(corner, corners[corner]);
    }
    return corners;
  }

  public getCornerPoint(corner: number, target: Vector3): Vector3 {
    //      7-------6
    //    / |      /|
    //   4-------5  |
    //   |  |    |  |
    //   Z  3----|--2
    //   | /     |Y
    //   0---X---1

    switch (corner) {
      case 0:
        return target.set(this.x.min, this.y.min, this.z.min);
      case 1:
        return target.set(this.x.max, this.y.min, this.z.min);
      case 2:
        return target.set(this.x.max, this.y.max, this.z.min);
      case 3:
        return target.set(this.x.min, this.y.max, this.z.min);
      case 4:
        return target.set(this.x.min, this.y.min, this.z.max);
      case 5:
        return target.set(this.x.max, this.y.min, this.z.max);
      case 6:
        return target.set(this.x.max, this.y.max, this.z.max);
      case 7:
        return target.set(this.x.min, this.y.max, this.z.max);
      default:
        throw Error('getCornerPoint');
    }
  }

  // ==================================================
  // INSTANCE METHODS: Plane intersection
  // ==================================================

  public getHorizontalIntersection(plane: Plane, cornerIndex: number): Vector3 {
    const corner = this.getCornerPoint(cornerIndex, newVector3());
    return plane.projectPoint(corner, corner);
  }

  public getIntersectionOfEdge(
    plane: Plane,
    cornerIndex1: number,
    cornerIndex2: number
  ): Vector3 | undefined {
    // Finds 2 corners and make a line between them, then intersect the line
    const corner1 = this.getCornerPoint(cornerIndex1, newVector3());
    const corner2 = this.getCornerPoint(cornerIndex2, newVector3());
    TEMPORARY_LINE.set(corner1, corner2);
    const point = plane.intersectLine(TEMPORARY_LINE, newVector3());
    return point ?? undefined;
  }

  public getVerticalPlaneIntersection(
    plane: Plane,
    isTop: boolean, // Give top or bottom of the range here
    start: Vector3,
    end: Vector3
  ): boolean {
    const startIndex = isTop ? 4 : 0;
    let count = 0;
    for (let corner = 0; corner < 4; corner++) {
      const corner1 = startIndex + corner;
      const corner2 = startIndex + ((corner + 1) % 4);
      const intersection = this.getIntersectionOfEdge(plane, corner1, corner2);
      if (intersection === undefined) {
        continue;
      }
      if (count === 0) {
        start.copy(intersection);
        count++;
        continue;
      }
      if (count === 1) {
        end.copy(intersection);
        count++;
        break;
      }
    }
    return count >= 2;
  }
  // ==================================================
  // INSTANCE METHODS: Operations
  // ==================================================

  public makeEmpty(): void {
    this.x.makeEmpty();
    this.y.makeEmpty();
    this.z.makeEmpty();
  }

  public copy(box: Box3): void {
    if (box.isEmpty()) {
      this.makeEmpty();
    } else {
      this.set(box.min, box.max);
    }
  }

  public set(min: Vector3, max: Vector3): void {
    this.x.set(min.x, max.x);
    this.y.set(min.y, max.y);
    this.z.set(min.z, max.z);
  }

  public translate(value: Vector3): void {
    this.x.translate(value.x);
    this.y.translate(value.y);
    this.z.translate(value.z);
  }

  public scaleDelta(value: Vector3): void {
    this.x.scaleDelta(value.x);
    this.y.scaleDelta(value.y);
    this.z.scaleDelta(value.z);
  }

  public scale(value: number): void {
    this.x.scale(value);
    this.y.scale(value);
    this.z.scale(value);
  }

  public add(value: Vector3): void {
    this.x.add(value.x);
    this.y.add(value.y);
    this.z.add(value.z);
  }

  public add2(value: Vector2): void {
    this.x.add(value.x);
    this.y.add(value.y);
  }

  public addHorizontal(value: Vector3): void {
    this.x.add(value.x);
    this.y.add(value.y);
  }

  public addRange(value: Range3 | undefined): void {
    if (value === undefined) return;
    this.x.addRange(value.x);
    this.y.addRange(value.y);
    this.z.addRange(value.z);
  }

  public expandByMargin(margin: number): void {
    this.x.expandByMargin(margin);
    this.y.expandByMargin(margin);
    this.z.expandByMargin(margin);
  }

  public expandByMargin3(margin: Vector3): void {
    this.x.expandByMargin(margin.x);
    this.y.expandByMargin(margin.y);
    this.z.expandByMargin(margin.z);
  }

  public expandByFraction(fraction: number): void {
    this.x.expandByFraction(fraction);
    this.y.expandByFraction(fraction);
    this.z.expandByFraction(fraction);
  }

  // ==================================================
  // STATIC METHODS
  // ==================================================

  public static createCube(halfSize: number): Range3 {
    const range = new Range3();
    range.x.set(-halfSize, halfSize);
    range.y.set(-halfSize, halfSize);
    range.z.set(-halfSize, halfSize);
    return range;
  }

  public static getCircleRangeMargin(normal: Vector3, radius: number, normalized = false): Vector3 {
    // http://gdalgorithms-list.narkive.com/s2wbl3Cd/axis-aligned-bounding-box-of-cylinder
    // https://en.wikipedia.org/wiki/Bounding_volume
    const dot = normal.clone();
    dot.multiply(normal);

    if (!normalized) {
      dot.divideScalar(normal.lengthSq()); // This do a normalization
    }
    if (dot.x > 1) dot.x = 1;
    if (dot.y > 1) dot.y = 1;
    if (dot.z > 1) dot.z = 1;

    const margin = dot.set(Math.sqrt(1 - dot.x), Math.sqrt(1 - dot.y), Math.sqrt(1 - dot.z));
    margin.multiplyScalar(radius);
    return margin;
  }
}

// ==================================================
// PRIVATE FUNCTIONS: Vector pool
// ==================================================

const TEMPORARY_LINE = new Line3(); // Temporary, used in getIntersection() only
const VECTOR_POOL = new Vector3Pool();
function newVector3(copyFrom?: Vector3): Vector3 {
  return VECTOR_POOL.getNext(copyFrom);
}
