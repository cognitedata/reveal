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

import { Vector3 } from "@/Core/Geometry/Vector3";
import { Range3 } from "@/Core/Geometry/Range3";
import { Shape } from "@/Core/Geometry/Shape";

export class Points extends Shape
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  public list: Vector3[] = [];

  public get length(): number { return this.list.length; }

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // OVERRIDES of Shape:
  //==================================================

  public /*override*/ clone(): Shape
  {
    const result = new Points();
    result.list = [...this.list]; // This syntax sucks!
    return result;
  }

  public/*override*/ expandBoundingBox(boundingBox: Range3): void
  {
    for (const point of this.list)
      boundingBox.add(point);
  }

  //==================================================
  // INSTANCE METHODS: Getters
  //==================================================

  public getSum(): Vector3
  {
    var sum = Vector3.newZero;
    for (const point of this.list)
      sum.add(point);
    return sum;
  }

  public getSumDelta(): Vector3
  {
    var sum = Vector3.newZero;
    for (let i = 1; i < this.list.length; i++)
    {
      const p0 = this.list[i - 1];
      const p1 = this.list[i];
      sum.add(p1);
      sum.substract(p0);
    }
    return sum;
  }

  //==================================================
  // INSTANCE METHODS: Operations
  //==================================================

  public add(point: Vector3): void { this.list.push(point); }
  public clear(): void { this.list.splice(0, this.list.length); }

  //==================================================
  // STATIC METHODS: 
  //==================================================

  public static createByRandom(pointCount: number, boundingBox: Range3): Points
  {
    const result = new Points();
    for (let i = 0; i < pointCount; i++)
      result.add(Vector3.getRandom(boundingBox));
    return result;
  }
}
