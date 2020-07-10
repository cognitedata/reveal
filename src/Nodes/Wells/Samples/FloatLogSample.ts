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

import { BaseLogSample } from "@/Nodes/Wells/Samples/BaseLogSample";

export class FloatLogSample extends BaseLogSample 
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  public value: number;

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(value: number, md: number)
  {
    super(md);
    this.value = value;
  }

  //==================================================
  // OVERRIDES of MdSample
  //==================================================

  public /*override*/ toString(): string { return `${super.toString()} Value: ${this.value}`; }
  public /*override*/ getSampleText(): string { return Number.isNaN(this.value) ? "Not defined" : this.value.toPrecision(6); }

  //==================================================
  // OVERRIDES of BaseLogSample
  //==================================================

  public /*override*/ get isEmpty(): boolean { return Number.isNaN(this.value); }

  public /*override*/  clone(): BaseLogSample { return new FloatLogSample(this.value, this.md); }
}  
