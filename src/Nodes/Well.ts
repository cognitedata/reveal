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

import { Vector3 } from "../Core/Geometry/Vector3";
import { Random } from "../Core/PrimitivClasses/Random";
import { Points } from "../Core/Geometry/Points";
import { Range3 } from "../Core/Geometry/Range3";
import { Range1 } from "../Core/Geometry/Range1";

export class Well extends Points
{
  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // STATIC METHODS: 
  //==================================================

  public static createByRandom(pointCount: number, boundingBox: Range3): Well
  {
    const result = new Well();
    const p0 = Vector3.getRandom(boundingBox);
    p0.z = 400;
    
    const p1 = p0.copy();
    p1.z += -200;

    const p2 = p1.copy();
    p2.x += Random.getFloat(new Range1(100, -100));
    p2.y += Random.getFloat(new Range1(100, -100));
    p2.z += -100;

    const p3 = p2.copy();
    p3.x += Random.getFloat(new Range1(300, -300));
    p3.y += Random.getFloat(new Range1(300, -300));
    p3.z += -50;

    result.add(p0);
    result.add(p1);
    result.add(p2);
    result.add(p3);
    return result;
  }

}
