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

export class LineSegment3
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  public origin: Vector3 = Vector3.newZero; // Min point
  public vector: Vector3 = Vector3.newZero; // Unit vector in direction to max
  public length = 0; // The distance between min and max

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get min(): Vector3 { return this.origin; }
  public get max(): Vector3 { return Vector3.addWithFactor(this.origin, this.vector, this.length); }

  //==================================================
  // CONSTRUCTOR
  //==================================================

  public constructor(min?: Vector3, max?: Vector3)
  {
    if (min === undefined || max === undefined)
      return;
    this.set(min, max);
  }

  //==================================================
  // INSTANCE METHODS: Getters
  //==================================================

  public getClosest(external: Vector3, result: Vector3): Vector3
  {
    result.copy(external);
    result.substract(this.origin);

    let t = this.vector.getDot(result);
    if (t < 0)
      t = 0;
    else if (t > this.length)
      t = this.length;

    result.copy(this.vector);
    result.multiplyScalar(t);
    result.add(this.origin);
    return result;
  }

  //==================================================
  // INSTANCE METHODS: Setters
  //==================================================

  public set(min: Vector3, max: Vector3): void
  {
    this.origin.copy(min);
    this.vector.copy(max);
    this.vector.substract(min);
    this.length = this.vector.length;
    this.vector.divideScalar(this.length);
  }
}
