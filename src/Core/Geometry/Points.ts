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

import { Vector3 } from "./Vector3";
import { Range3 } from "./Range3";
import { Range1 } from "./Range1";

export class Points
{
  //==================================================
  // FIELDS
  //==================================================

  public list: Vector3[] = [];
  public get count(): number { return this.list.length; }

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { }

  public copy(): Points
  {
    const result = new Points();
    result.list = [...this.list]; // This syntax sucks!
    return result;
  }

  //==================================================
  // INSTANCE METHODS: Getters
  //==================================================

  public getZRange(): Range1
  {
    const range: Range1 = new Range1();
    for (const point of this.list)
      range.add(point.z);
    return range;
  }

  public getRange(): Range3
  {
    const range: Range3 = new Range3();
    for (const point of this.list)
      range.add(point);
    return range;
  }

  //==================================================
  // INSTANCE METHODS: Operations
  //==================================================

  public add(point: Vector3): void
  {
    this.list.push(point);
  }

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
