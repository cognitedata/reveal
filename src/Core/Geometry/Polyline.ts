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
import { Points } from "@/Core/Geometry/Points";
import { Range3 } from "@/Core/Geometry/Range3";
import { Shape } from "@/Core/Geometry/Shape";

export class Polyline extends Points
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  public isClosed: boolean = false;

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // OVERRIDES of Shape:
  //==================================================

  public /*override*/ clone(): Shape
  {
    const result = new Polyline();
    result.list = [...this.list]; // This syntax sucks!
    return result;
  }

  //==================================================
  // INSTANCE METHODS: Getters
  //==================================================

  public getLength(dimension: number = 3): number 
  {
    let length = 0;
    const maxIndex = this.list.length - 1;
    for (let i = 1; i <= maxIndex; i++)
    {
      const p0 = this.list[i - 1];
      const p1 = this.list[i];
      length += dimension = 3 ? p0.distance(p1) : p0.distance2(p1);
    }
    if (this.isClosed)
    {
      const p0 = this.list[maxIndex];
      const p1 = this.list[0];
      length += dimension = 3 ? p0.distance(p1) : p0.distance2(p1);
    }
    return length;
  }

  public getArea(): number { return Math.abs(this.getSignedArea()); }

  public getSignedArea(): number 
  {
    var n = this.length;
    if (n == 2)
      return 0;

    let area = 0;
    var first = this.list[0];
    var p0 = Vector3.newZero;
    for (var index = 1; index <= n; index++)
    {
      var p1 = this.list[index % n];
      p1.substract(first); // Translate down to first point, to increase acceracy
      area += p0.getCross2(p1);
      p0 = p1;
    }
    return area * 0.5;
  }

  //==================================================
  // STATIC METHODS: 
  //==================================================

  public static createByRandom(pointCount: number, boundingBox: Range3): Polyline
  {
    const result = new Polyline();
    for (let i = 0; i < pointCount; i++)
      result.add(Vector3.getRandom(boundingBox));
    return result;
  }
}
