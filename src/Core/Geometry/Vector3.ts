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
  // FIELDS
  //==================================================

  public x: number;
  public y: number;
  public z: number;

  //==================================================
  // PROPERTIES
  //==================================================

  public static get newZero(): Vector3 { return new Vector3(0, 0, 0); }
  public static get newNaN(): Vector3 { return new Vector3(Number.NaN, Number.NaN, Number.NaN); }
  public get squareLength(): number { return this.x * this.x + this.y * this.y + this.z * this.z; }
  public get length(): number { return Math.sqrt(this.squareLength); }

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

  public equals(other: Vector3): boolean { return this.x == other.x && this.y == other.y && this.z == other.z; }

  //==================================================
  // INSTANCE METHODS: Getters
  //==================================================

  public toString(): string { return `(${this.x}, ${this.y}, ${this.z})`; }

  //==================================================
  // INSTANCE METHODS: Operations
  //==================================================

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

  public muliply(point: Vector3): void
  {
    this.x *= point.x;
    this.y *= point.y;
    this.z *= point.z;
  }

  public muliplyNumber(value: number): void
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

  public divideNumber(value: number): void
  {
    this.x /= value;
    this.y /= value;
    this.z /= value;
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

}
