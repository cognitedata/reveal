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

import { Polyline } from "@/Core/Geometry/Polyline";
import { Range3 } from "@/Core/Geometry/Range3";
import { Shape } from "@/Core/Geometry/Shape";

export class Polylines extends Shape
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  public list: Polyline[] = [];

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
    const result = new Polylines();
    for (const polyline of this.list)
      result.list.push(polyline.clone() as Polyline);
    return result;
  }

  public/*override*/ expandBoundingBox(boundingBox: Range3): void
  {
    for (const polyline of this.list)
      boundingBox.addRange(polyline.boundingBox);
  }

  //==================================================
  // STATIC METHODS: 
  //==================================================

  public static createByRandom(polylinesCount: number, pointCount: number, boundingBox: Range3): Polylines
  {
    const result = new Polylines();
    for (let i = 0; i < polylinesCount; i++)
      result.list.push(Polyline.createByRandom(pointCount, boundingBox));
    return result;
  }
}
