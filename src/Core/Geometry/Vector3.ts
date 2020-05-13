import { Range3 } from "./Range3";
import { Random } from "../PrimitiveClasses/Random";

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

export class Vector3
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  public x: number;
  public y: number;
  public z: number;

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public static get newZero(): Vector3 { return new Vector3(0, 0, 0); }
  public static get newEmpty(): Vector3 { return new Vector3(Number.NaN, Number.NaN, Number.NaN); }
  public get squareLength(): number { return this.x * this.x + this.y * this.y + this.z * this.z; }
  public get length(): number { return Math.sqrt(this.squareLength); }
  public get isEmpty(): boolean { return isNaN(this.x) || isNaN(this.y) || isNaN(this.z); }

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(x: number, y: number, z: number = 0)
  {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  public /*copy constructor*/ copy(): Vector3
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

  public dot(other: Vector3): number { return this.x * other.x + this.y * other.y + this.z * other.z; }

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

  //==================================================
  // INSTANCE METHODS: Operations
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

  public set(x: number, y: number, z: number = 0): void
  {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  public add(point: Vector3): void
  {
    this.x += point.x;
    this.y += point.y;
    this.z += point.z;
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

  public multiplyByNumber(value: number): void
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

  public divideByNumber(value: number): void
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

  public normalize(): boolean
  {
    const len = this.length;
    if (len < Number.EPSILON)
      return false;

    this.x /= len;
    this.y /= len;
    this.z /= len;
    return true;
  }

  public static getRandom(range: Range3): Vector3
  {
    const x = Random.getFloat(range.x);
    const y = Random.getFloat(range.y);
    const z = Random.getFloat(range.z);
    return new Vector3(x, y, z);
  }

  public static getCenterOf2(a: Vector3, b: Vector3): Vector3
  {
    const result = a.copy();
    result.add(b);
    result.divideByNumber(2);
    return result;
  }

  public static getCenterOf4(a: Vector3, b: Vector3, c: Vector3, d: Vector3): Vector3
  {
    const result = a.copy();
    result.add(b);
    result.add(c);
    result.add(d);
    result.divideByNumber(4);
    return result;
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
      default: return "Undefined";;
    }
  }
}
