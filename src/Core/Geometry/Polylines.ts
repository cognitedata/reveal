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

import { Polyline } from "./Polyline";
import { Range1 } from "./Range1";
import { Range3 } from "./Range3";

export class Polylines
{
  //==================================================
  // FIELDS
  //==================================================

  public list: Polyline[] = [];

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { }

  //==================================================
  // STATIC METHODS: 
  //==================================================

  public static createByRandom(polylinesCount: number, pointCount: number, range: Range1): Polylines
  {
    const result = new Polylines();
    for (let i = 0; i < polylinesCount; i++)
      result.list.push(Polyline.createByRandom(pointCount, range))
    return result;
  }

  public getRange(): Range3
  {
    const range: Range3 = new Range3();
    for (const polyline of this.list)
      range.addRange(polyline.getRange());
    return range;
  }
}
