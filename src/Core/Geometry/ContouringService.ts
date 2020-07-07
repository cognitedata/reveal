//=====================================================================================
// This code is part of the Reveal Viewer architecture, made by Nils Petter Fremming  
// in October 2019. It is suited for flexible and customizable visualization of   
// multiple dataset in multiple viewers.
//
// It is a C# to typescript port from the Modern Model architecture,   
// based on the experience when building Petrel.  
//
// NOTE: always keep the code according to the code style already applied in the file.
// Put new code under the correct section, and make more sections if needed.
// Copyright (c) Cognite aS. all rights reserved.
//=====================================================================================

import * as THREE from "three";

import { RegularGrid2 } from "@/Core/Geometry/RegularGrid2";
import { Vector3 } from "@/Core/Geometry/Vector3";
import { Ma } from "@/Core/Primitives/Ma";
import { Range1 } from "@/Core/Geometry/Range1";

export class ContouringService
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  private range = Range1.newZero;
  private inc: number;
  private tolerance: number;
  private positions: number[] = [];

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(inc: number)
  {

    this.inc = inc;
    this.tolerance = this.inc / 1000;
  }

  //==================================================
  // INSTANCE METHODS: Create functions
  //==================================================

  public createContoursAsXyzArray(grid: RegularGrid2): number[]
  {

    const p0 = Vector3.newZero;
    const p1 = Vector3.newZero;
    const p2 = Vector3.newZero;
    const p3 = Vector3.newZero;

    for (let i = 0; i < grid.nodeSize.i - 1; i++)
    {
      for (let j = 0; j < grid.nodeSize.j - 1; j++)
      {
        const isDef0 = grid.getRelativePosition(i + 0, j + 0, p0);
        const isDef1 = grid.getRelativePosition(i + 1, j + 0, p1);
        const isDef2 = grid.getRelativePosition(i + 1, j + 1, p2);
        const isDef3 = grid.getRelativePosition(i + 0, j + 1, p3);

        let triangleCount = 0;
        if (isDef0) triangleCount++;
        if (isDef2) triangleCount++;
        if (isDef2) triangleCount++;
        if (isDef3) triangleCount++;

        if (triangleCount < 3)
          continue;

        //(i,j+1)     (i+1,j+1)
        //     3------2
        //     |      |
        //     0------1
        //(i,j)       (i+1,j)

        if (!isDef0)
          this.addTriangle(p1, p2, p3);
        if (triangleCount === 4 || !isDef1)
          this.addTriangle(p0, p2, p3);
        if (!isDef2)
          this.addTriangle(p0, p1, p3);
        if (triangleCount === 4 || !isDef3)
          this.addTriangle(p0, p1, p2);
      }
    }
    return this.positions;
  }

  //==================================================
  // INSTANCE METHODS: Helpers
  //==================================================

  private addTriangle(a: Vector3, b: Vector3, c: Vector3): void
  {

    this.range.set(Ma.min(a.z, b.z, c.z), Ma.max(a.z, b.z, c.z));

    for (const anyTick of this.range.getFastTicks(this.inc, this.tolerance))
    {
      const z = Number(anyTick);
      this.addLevelAt(z, a, b, c);
    }
  }

  private addLevelAt(z: number, a: Vector3, b: Vector3, c: Vector3): boolean
  {

    // Make sure we don't run into numerical problems
    if (Ma.IsAbsEqual(a.z, z, this.tolerance))
      a.z = z + this.tolerance;
    if (Ma.IsAbsEqual(b.z, z, this.tolerance))
      b.z = z + this.tolerance;
    if (Ma.IsAbsEqual(c.z, z, this.tolerance))
      c.z = z + this.tolerance;
    if (Ma.IsAbsEqual(a.z, b.z, this.tolerance))
      b.z = a.z + this.tolerance;

    // Special cases, check exact intersection on the corner or along the edges
    if (a.z == z)
    {
      if (Ma.isInside(b.z, z, c.z))
      {
        this.add(a);
        this.addLinearInterpolation(b, c, z);
        return true;
      }
      if (b.z == z && c.z != z)
      {
        this.add(a);
        this.add(b);
        return true;
      }
      if (c.z == z && b.z != z)
      {
        this.add(c);
        this.add(a);
        return true;
      }
    }
    if (b.z == z)
    {
      if (Ma.isInside(c.z, z, a.z))
      {
        this.add(b);
        this.addLinearInterpolation(c, a, z);
        return true;
      }
      if (c.z == z && a.z != z)
      {
        this.add(b);
        this.add(c);
        return true;
      }
    }
    if (c.z == z && Ma.isInside(a.z, z, b.z))
    {
      this.add(c);
      this.addLinearInterpolation(a, b, z);
      return true;
    }
    // Intersection of two of the edges
    var numPoints = 0;
    if (Ma.isInside(a.z, z, b.z))
    {
      this.addLinearInterpolation(a, b, z);
      numPoints++;
    }
    if (Ma.isInside(b.z, z, c.z))
    {
      if (numPoints == 0)
        this.addLinearInterpolation(b, c, z);
      else
        this.addLinearInterpolation(b, c, z);
      numPoints++;
    }
    if (numPoints < 2 && Ma.isInside(c.z, z, a.z))
    {
      if (numPoints == 0)
        this.addLinearInterpolation(c, a, z);
      else
        this.addLinearInterpolation(c, a, z);
      numPoints++;
    }
    if (numPoints == 2)
      return true;

    if (numPoints == 1)
    {
      // Remove the last added
      this.positions.pop();
      this.positions.pop();
      this.positions.pop();
    }
    return false;
  }


  private add(position: Vector3): void
  {
    this.positions.push(position.y, position.y, position.z);
  }

  private addLinearInterpolation(a: Vector3, b: Vector3, z: number): void
  {
    // Z is assumed to be on or between a.Z and b.Z, used by the function below
    // a.Z and b.Z is assumed to be different (Check by yourself)
    // Returns  a + (b-a)*(z-a.Z)/(b.Z-a.Z);  (unrolled code)
    var f = (z - a.z) / (b.z - a.z);
    this.positions.push((b.x - a.x) * f + a.x, (b.y - a.y) * f + a.y, z);
  }
}

