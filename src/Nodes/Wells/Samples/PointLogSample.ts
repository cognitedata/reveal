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
import { LoDashImplicitNumberArrayWrapper } from "lodash";

export class PointLogSample extends BaseLogSample 
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  public mdEnd: number;
  public decription: string;
  public subtype: string = "";
  public riskSubCategory: string = "";
  public details: string = "";
  public isOpen = false;

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(decription: string, mdStart: number, mdEnd?: number)
  {
    super(mdStart);
    this.decription = decription;
    if (mdEnd === undefined)
      this.mdEnd = mdStart;
    else
      this.mdEnd = mdEnd;
  }

  //==================================================
  // OVERRIDES of MdSample
  //==================================================

  public /*override*/ toString(): string { return `${super.toString()} Value: ${this.decription}`; }
  public /*override*/ sampleText(): string { return `Value: ${this.decription}`; }

  //==================================================
  // OVERRIDES of BaseLogSample
  //==================================================

  public /*override*/ get isEmpty(): boolean { return false; }

  public /*override*/ isEqual(other: BaseLogSample): boolean
  {
    const otherSample = other as PointLogSample;
    if (!otherSample)
      return false;
    return this.decription === otherSample.decription;
  }

  public /*override*/ copyValueFrom(other: BaseLogSample): void
  {
    const otherSample = other as PointLogSample;
    if (!otherSample)
      return;
    this.decription = otherSample.decription;
  }

  public /*override*/  clone(): BaseLogSample { return new PointLogSample(this.decription, this.md); }
}  
