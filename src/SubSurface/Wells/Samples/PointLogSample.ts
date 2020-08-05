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

import * as Lodash from 'lodash';

import { BaseLogSample } from "@/SubSurface/Wells/Samples/BaseLogSample";

export class PointLogSample extends BaseLogSample 
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  public baseMd: number;

  public description: string;

  public subtype: string = "";

  public riskSubCategory: string = "";

  public details: string = "";

  public isOpen = false;

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(description: string, topMd: number, baseMd?: number)
  {
    super(topMd);
    this.description = description;
    if (baseMd === undefined || Number.isNaN(baseMd))
      this.baseMd = topMd;
    else
      this.baseMd = baseMd;
  }

  //==================================================
  // OVERRIDES of MdSample
  //==================================================

  public /*override*/ toString(): string { return `${super.toString()} Value: ${this.description}`; }

  public /*override*/ getSampleText(): string { return this.description; }

  //==================================================
  // OVERRIDES of BaseLogSample
  //==================================================

  public /*override*/ get isEmpty(): boolean { return false; }

  public /*override*/ clone(): BaseLogSample { return Lodash.clone<PointLogSample>(this); }
}  
