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

import { MdSample } from "@/Nodes/Wells/Samples/MdSample";
import { Vector3 } from "@/Core/Geometry/Vector3";

export class TrajectorySample extends MdSample 
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  public point: Vector3;
  public inclination = 0;
  public azimuth = 0;

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(point: Vector3, md = 0)
  {
    super(md);
    this.point = point.copy();
  }

  //==================================================
  // OVERRIDES from MdSample
  //==================================================

  public /*override*/ toString(): string { return `${super.toString()} Point: ${this.point}`; }
  public /*override*/ sampleText(): string { return `Point: ${this.point}`; }
}  
