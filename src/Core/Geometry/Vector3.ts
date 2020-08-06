//=====================================================================================
// This code is part of the Reveal Viewer architecture, made by Nils Petter Fremming  
// in October 2019. It is suited for flexible and customizable visualization of   
// multiple dataset in multiple viewers.
//
// It is a C# to typescript port from the Modern Model architecture,   
// based on the experience when building Petrel.  
//
// NOTE: Always keep the code according to the code style already applied in the file.
// Put new code under the correct section, and make more sections if needed.
// Copyright (c) Cognite AS. All rights reserved.
//=====================================================================================

import { Range3 } from "@/Core/Geometry/Range3";
import { Random } from "@/Core/Primitives/Random";
import { Ma } from "@/Core/Primitives/Ma";

export class Vector3
{
  //==================================================
  // STATIC PROPERTIES
  //==================================================

  public static get newUp(): Vector3 { return new Vector3(0, 0, 1); }
  public static get newZero(): Vector3 { return new Vector3(0, 0, 0); }
  public static get newEmpty(): Vector3 { return new Vector3(Number.NaN, Number.NaN, Number.NaN); }

  //==================================================
  // INSTANCE FIELDS
  //==================================================

  public x: number;
  public y: number;
  public z: number;

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get squareLength(): number { return this.x * this.x + this.y * this.y + this.z * this.z; }
  public get length(): number { return Math.sqrt(this.squareLength); }
  public get isEmpty(): boolean { return isNaN(this.x) || isNaN(this.y) || isNaN(this.z); }
  public get minCoord(): number { return Math.min(this.x, this.y, this.z); }
  public get maxCoord(): number { return Math.max(this.x, this.y, this.z); }
  public get absMinCoord(): number { return Math.min(Math.abs(this.x), Math.abs(this.y), Math.abs(this.z)); }
  public get absMaxCoord(): number { return Math.max(Math.abs(this.x), Math.abs(this.y), Math.abs(this.z)); }

  public get absMinDimension(): number
  {
    let result = 0;
    let min = Math.abs(this.x);
    if (Math.abs(this.y) < min)
    {
      result = 1;
      min = Math.abs(this.y);
    }
    return Math.abs(this.z) < min ? 2 : result;
  }

  public get absMaxDimension(): number
  {
    let result = 0;
    let max = Math.abs(this.x);
    if (Math.abs(this.y) > max)
    {
      result = 1;
      max = Math.abs(this.y);
    }
    return Math.abs(this.z) > max ? 2 : result;
  }

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(x: number, y: number, z = 0)
  {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  public clone(): Vector3
  {
    return new Vector3(this.x, this.y, this.z);
  }

  //==================================================
  // INSTANCE METHODS: Requests
  //==================================================

  public equals(other: Vector3): boolean { return this.x === other.x && this.y === other.y && this.z === other.z; }

  //==================================================
  // INSTANCE METHODS: Getters
  //==================================================

  public toString(): string { return `(${this.x}, ${this.y}, ${this.z})`; }
  public getString(decimals: number): string { return `(${this.x.toFixed(decimals)}, ${this.y.toFixed(decimals)}, ${this.z.toFixed(decimals)})`; }
  public squareDistance(other: Vector3): number { return Ma.square(this.x - other.x) + Ma.square(this.y - other.y) + Ma.square(this.z - other.z); }
  public squareDistance2(other: Vector3): number { return Ma.square(this.x - other.x) + Ma.square(this.y - other.y); }
  public distance(other: Vector3): number { return Math.sqrt(this.squareDistance(other)); }
  public distance2(other: Vector3): number { return Math.sqrt(this.squareDistance2(other)); }

  public getAt(dimension: number): number
  {
    switch (dimension)
    {
      case 0: return this.x;
      case 1: return this.y;
      case 2: return this.z;
      default: return Number.NaN;
    }
  }

  public getDot(other: Vector3): number { return this.x * other.x + this.y * other.y + this.z * other.z; }
  public getCross2(other: Vector3): number { return this.x * other.y - this.y * other.x; }

  public getCross(other: Vector3): Vector3
  {
    return new Vector3(
      this.y * other.z - this.z * other.y,
      this.z * other.x - this.x * other.z,
      this.x * other.y - this.y * other.x
    );
  }

  public getNormal(other: Vector3): Vector3
  {
    const cross = this.getCross(other);
    cross.normalize();
    return cross;
  }

  //==================================================
  // INSTANCE METHODS: Setters
  //==================================================

  public setAt(dimension: number, value: number): void
  {
    switch (dimension)
    {
      case 0: this.x = value; break;
      case 1: this.y = value; break;
      case 2: this.z = value; break;
    }
  }

  public set(x: number, y: number, z = 0): void
  {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  public copy(other: Vector3): void
  {
    this.x = other.x;
    this.y = other.y;
    this.z = other.z;
  }

  //==================================================
  // INSTANCE METHODS: Operations
  //==================================================

  public negate(): void
  {
    this.x = -this.x;
    this.y = -this.y;
    this.z = -this.z;
  }

  public abs(): void
  {
    this.x = Math.abs(this.x);
    this.y = Math.abs(this.y);
    this.z = Math.abs(this.z);
  }

  public normalize(): boolean
  {
    const { length } = this;
    if (length < Number.EPSILON)
      return false;

    this.divideScalar(length);
    return true;
  }

  public rotatePiHalf(): void
  {
    const x = this.x;
    this.x = this.y;
    this.y = -x;
  }

  public add(point: Vector3): void
  {
    this.x += point.x;
    this.y += point.y;
    this.z += point.z;
  }

  public addWithFactor(point: Vector3, factor: number): void
  {
    this.x += point.x * factor;
    this.y += point.y * factor;
    this.z += point.z * factor;
  }

  public addScalar(value: number): void
  {
    this.x += value;
    this.y += value;
    this.z += value;
  }

  public substract(point: Vector3): void
  {
    this.x -= point.x;
    this.y -= point.y;
    this.z -= point.z;
  }

  public multiply(point: Vector3): void
  {
    this.x *= point.x;
    this.y *= point.y;
    this.z *= point.z;
  }

  public multiplyScalar(value: number): void
  {
    this.x *= value;
    this.y *= value;
    this.z *= value;
  }

  public divide(point: Vector3): void
  {
    this.x /= point.x;
    this.y /= point.y;
    this.z /= point.z;
  }

  public divideScalar(value: number): void
  {
    this.x /= value;
    this.y /= value;
    this.z /= value;
  }

  public scaleZ(zScale: number): void
  {
    this.z *= zScale;
  }

  public crossProduct(other: Vector3): void
  {
    this.set(
      this.y * other.z - this.z * other.y,
      this.z * other.x - this.x * other.z,
      this.x * other.y - this.y * other.x
    );
  }

  public lerp(a: Vector3, b: Vector3, fb: number): void
  {
    // this = A * (1-fb) + B * fb
    const fa = 1 - fb;
    this.x = a.x * fa + b.x * fb;
    this.y = a.y * fa + b.y * fb;
    this.z = a.z * fa + b.z * fb;
  }

  //==================================================
  // STATIC METHODS: Getters
  //==================================================

  public static getRandom(range: Range3): Vector3
  {
    const x = Random.getFloat(range.x);
    const y = Random.getFloat(range.y);
    const z = Random.getFloat(range.z);
    return new Vector3(x, y, z);
  }

  public static getAxis(dimension: number): Vector3
  {
    switch (dimension)
    {
      case 0: return new Vector3(1, 0, 0);
      case 1: return new Vector3(0, 1, 0);
      case 2: return new Vector3(0, 0, 1);
      default: return Vector3.newEmpty;
    }
  }

  public static getAxisName(dimension: number): string
  {
    switch (dimension)
    {
      case 0: return "X";
      case 1: return "Y";
      case 2: return "Z";
      default: return "Undefined";
    }
  }

  //==================================================
  // STATIC METHODS: Arithmetical operations
  //==================================================

  // Return = (A + B) / 2
  public static getCenterOf2(a: Vector3, b: Vector3): Vector3
  {
    return new Vector3((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
  }

  // Return = (A + B + C + D) / 4
  public static getCenterOf4(a: Vector3, b: Vector3, c: Vector3, d: Vector3): Vector3
  {
    return new Vector3((a.x + b.x + c.x + d.x) / 4, (a.y + b.y + c.y + d.y) / 4, (a.z + b.z + c.z + d.z) / 4);
  }

  // Return = A + B * fb
  public static addWithFactor(a: Vector3, b: Vector3, fb: number): Vector3 { return new Vector3(a.x + b.x * fb, a.y + b.y * fb, a.z + b.z * fb); }

  // Return = A - B
  public static substract(a: Vector3, b: Vector3): Vector3
  {
    return new Vector3(a.x - b.x, a.y - b.y, a.z - b.z);
  }
}
