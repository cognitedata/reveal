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

import { Range1 } from "./Range1";
import { Vector3 } from "./Vector3";

export class Range3
{
  //==================================================
  // STATIC FPROPERTIES
  //==================================================

  public static get newUnit(): Range3
  {
    const range = new Range3();
    range.x = Range1.newUnit;
    range.y = Range1.newUnit;
    range.z = Range1.newUnit;
    return range;
  }

  public static get newTest(): Range3
  {
    const range = new Range3();
    range.x = Range1.newTest;
    range.y = Range1.newTest;
    range.z = Range1.newZTest;
    return range;
  }

  //==================================================
  // FIELDS
  //==================================================

  public x: Range1 = new Range1();
  public y: Range1 = new Range1();
  public z: Range1 = new Range1();

  //==================================================
  // PROPERTIES
  //==================================================

  public get isEmpty(): boolean { return this.x.isEmpty || this.y.isEmpty || this.z.isEmpty; }
  public get min(): Vector3 { return new Vector3(this.x.min, this.y.min, this.z.min); }
  public get max(): Vector3 { return new Vector3(this.x.max, this.y.max, this.z.max); }
  public get delta(): Vector3 { return new Vector3(this.x.delta, this.y.delta, this.z.delta); }
  public get center(): Vector3 { return new Vector3(this.x.center, this.y.center, this.z.center); }

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() 
  {
  }

  public /*copy constructor*/ copy(): Range3
  {
    const range = new Range3();
    range.x = this.x.copy();
    range.y = this.y.copy();
    range.z = this.z.copy();
    return range;
  }

  //==================================================
  // INSTANCE METHODS; Getters
  //==================================================

  public toString(): string { return `(X: ${this.x.toString()}, Y: ${this.y.toString()}, Z: ${this.z.toString()})`; }

  //==================================================
  // INSTANCE METHODS: Operations
  //==================================================

  public set(min: Vector3, max: Vector3): void
  {
    this.x.set(min.x, max.x);
    this.x.set(min.y, max.y);
    this.x.set(min.z, max.z);
  }

  public add(value: Vector3): void
  {
    this.x.add(value.x);
    this.y.add(value.y);
    this.z.add(value.z);
  }

  public addRange(value: Range3 | undefined): void
  {
    if (value === undefined)
      return;
    this.x.addRange(value.x);
    this.y.addRange(value.y);
    this.z.addRange(value.z);
  }

  //==================================================
  // STATIC METHODS:
  //==================================================

  public static create(xmin: number, ymin: number, xmax: number, ymax: number): Range3
  {
    const range = new Range3();
    range.x.set(xmin, xmax);
    range.y.set(ymin, ymax);
    return range;
  }
}
