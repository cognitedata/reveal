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
  public get aspectRatio2(): number { return this.x.delta / this.y.delta; }
  public get volume(): number { return this.x.delta * this.y.delta * this.z.delta; }

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(min?: Vector3, max?: Vector3) 
  {
    if (min === undefined && max !== undefined)
      this.set(max, max);
    else if (min !== undefined && max === undefined)
      this.set(min, min);
    else if (min !== undefined && max !== undefined)
      this.set(min, max);
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
    this.y.set(min.y, max.y);
    this.z.set(min.z, max.z);
  }

  public translate(value: Vector3): void
  {
    this.x.translate(value.x);
    this.y.translate(value.y);
    this.z.translate(value.z);
  }

  public scale(value: Vector3): void
  {
    this.x.scale(value.x);
    this.y.scale(value.y);
    this.z.scale(value.z);
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

  expandByMargin(margin: number)
  {
    this.x.expandByMargin(margin);
    this.y.expandByMargin(margin);
    this.z.expandByMargin(margin);
  }

  expandByFraction(fraction: number)
  {
    this.x.expandByFraction(fraction);
    this.y.expandByFraction(fraction);
    this.z.expandByFraction(fraction);
  }

  //==================================================
  // STATIC METHODS:
  //==================================================

  public static createByMinAndMax(xmin: number, ymin: number, xmax: number, ymax: number): Range3
  {
    const range = new Range3();
    range.x.set(xmin, xmax);
    range.y.set(ymin, ymax);
    range.z.set(0, 0);
    return range;
  }

  public static createByMinAndDelta(xmin: number, ymin: number, dx: number, dy: number): Range3
  {
    const range = new Range3();
    range.x.set(xmin, xmin + dx);
    range.y.set(ymin, ymin + dy);
    range.z.set(0, 0);
    return range;
  }
}
