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

export class DiscreteLogSample extends BaseLogSample 
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
  public /*override*/ sampleText(): string { return `Value: ${this.value}`; }

  //==================================================
  // OVERRIDES of BaseLogSample
  //==================================================

  public /*override*/ get isEmpty(): boolean { return Number.isNaN(this.value); }

  public /*override*/ isEqual(other: BaseLogSample): boolean
  {
    const otherSample = other as DiscreteLogSample;
    if (!otherSample)
      return false;
    return this.value === otherSample.value;
  }

  public /*override*/ copyValueFrom(other: BaseLogSample): void
  {
    const otherSample = other as DiscreteLogSample;
    if (!otherSample)
      return;
    this.value = otherSample.value;
  }

  public /*override*/  clone(): BaseLogSample { return new DiscreteLogSample(this.value, this.md); }
}  
