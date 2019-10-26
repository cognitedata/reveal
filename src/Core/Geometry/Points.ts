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
import { Random } from "../PrimitivClasses/Random";
import { Range1 } from "./Range1";
import { Range3 } from "./Range3";

export class Points
{
  //==================================================
  // FIELDS
  //==================================================

  public list: Vector3[] = [];

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { }

  public copy(): Points
  {
    const result = new Points()
    result.list = [...this.list]; // This syntax sucks!
    return result;
  }

  //==================================================
  // INSTANCE METHODS: Getters
  //==================================================

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

  public static createByRandom(pointCount: number, range: Range1): Points
  {
    const result = new Points();
    for (let i = 0; i < pointCount; i++)
    {
      const x = Random.getFloat(range.min, range.max);
      const y = Random.getFloat(range.min, range.max);
      const z = Random.getFloat(range.min, range.max);
      const point = new Vector3(x, y, z);
      result.add(point);
    }
    return result;
  }

}
