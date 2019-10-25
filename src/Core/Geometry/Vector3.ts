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

  public static get newZero(): Vector3 { return new Vector3(0, 0, 0); }

  public get squuareLength(): number { return this.x * this.x + this.y * this.y + this.z * this.z; }
  public get length(): number { return Math.sqrt(this.length); }

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(x: number, y: number, z: number)
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
  // INSTANCE METHODS; Getters
  //==================================================

  public toString(): string { return `(${this.x}, ${this.y}, ${this.z})`; }

  //==================================================
  // INSTANCE METHODS: Operations
  //==================================================

  public set(x: number, y: number, z: number): void
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

  public divide(point: Vector3): void
  {
    this.x /= point.x;
    this.y /= point.y;
    this.z /= point.z;
  }

  public crossProduct(a: Vector3): void { this.set(this.y * a.z - this.z * a.y, this.z * a.x - this.x * a.z, this.x * a.y - this.y * a.x); }

  public normalize(): boolean
  {
    const len = length;
    if (len < Number.EPSILON)
      return false;

    this.x /= len;
    this.y /= len;
    this.z /= len;
    return true;
  }
}
