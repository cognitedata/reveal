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

export class PointLogSample extends BaseLogSample 
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  public mdEnd: number;
  public description: string;
  public subtype: string = "";
  public riskSubCategory: string = "";
  public details: string = "";
  public isOpen = false;

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(description: string, mdStart: number, mdEnd?: number)
  {
    super(mdStart);
    this.description = description;
    if (mdEnd === undefined || Number.isNaN(mdEnd))
      this.mdEnd = mdStart;
    else
      this.mdEnd = mdEnd;
  }

  //==================================================
  // OVERRIDES of MdSample
  //==================================================

  public /*override*/ toString(): string { return `${super.toString()} Value: ${this.description}`; }
  public /*override*/ sampleText(): string { return `Value: ${this.description}`; }

  //==================================================
  // OVERRIDES of BaseLogSample
  //==================================================

  public /*override*/ get isEmpty(): boolean { return false; }

  public /*override*/  clone(): BaseLogSample { return new PointLogSample(this.description, this.md); }
}  
