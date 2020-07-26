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

import { Range3 } from "@/Core/Geometry/Range3";
import { Range1 } from "@/Core/Geometry/Range1";

export abstract class Shape
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  private _boundingBox: Range3 | undefined;

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get zRange(): Range1 { return this.boundingBox.z; }

  public get boundingBox(): Range3
  {
    if (!this._boundingBox)
      this._boundingBox = this.calculateBoundingBox();
    return this._boundingBox;
  }

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { }

  //==================================================
  // VIRTUAL METHODS:
  //==================================================

  public abstract clone(): Shape;
  public abstract expandBoundingBox(boundingBox: Range3): void;

  //==================================================
  // INSTANCE METHODS: Md range
  //==================================================

  public calculateBoundingBox(): Range3
  {
    const boundingBox = new Range3();
    this.expandBoundingBox(boundingBox);
    return boundingBox;
  }

  public touch(): void
  {
    this._boundingBox = undefined;
  }
}
