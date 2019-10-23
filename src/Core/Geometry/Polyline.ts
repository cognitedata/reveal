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
import { Points } from "./Points";

export class Polyline extends Points
{
  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // STATIC METHODS: 
  //==================================================

  public static createByRandom(pointCount: number): Polyline
  {
    const result = new Polyline();
    for (let i = 0; i < pointCount; i++)
    {
      const x = Random.getFloat(0, 100);
      const y = Random.getFloat(0, 100);
      const z = Random.getFloat(0, 100);
      const point = new Vector3(x, y, z);
      result.add(point);
    }
    return result;
  }

}
