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

import { BaseLogSample } from "./BaseLogSample";

export class PointLogSample extends BaseLogSample 
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  public label: string;

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(label: string, md: number)
  {
    super(md);
    this.label = label;
  }

  //==================================================
  // OVERRIDES of MdSample
  //==================================================

  public /*override*/ toString(): string { return `${super.toString()} Value: ${this.label}`; }
  public /*override*/ sampleText(): string { return `Value: ${this.label}`; }

  //==================================================
  // OVERRIDES of BaseLogSample
  //==================================================

  public /*override*/ get isEmpty(): boolean { return false; }

  public /*override*/ isEqual(other: BaseLogSample): boolean
  {
    const otherSample = other as PointLogSample;
    if (!otherSample)
      return false;
    return this.label === otherSample.label;
  }

  public /*override*/ copyValueFrom(other: BaseLogSample): void
  {
    const otherSample = other as PointLogSample;
    if (!otherSample)
      return;
    this.label = otherSample.label;
  }

  public /*override*/  clone(): BaseLogSample { return new PointLogSample(this.label, this.md); }
}  
