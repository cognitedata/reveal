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

import { Ma } from "@/Core/Primitives/Ma";

export class MdSample 
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  public md: number;

  public get isMdEmpty(): boolean { return Number.isNaN(this.md); }

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(md = 0) { this.md = md; }

  //==================================================
  // VIRTUAL METHODS
  //==================================================

  public /*virtual*/ toString(): string { return `Md: ${this.md}`; }

  public /*virtual*/ getSampleText(): string { return ``; }

  public /*virtual*/ translate(deltaMd: number, isAtMinMd: boolean): void { this.md += deltaMd; }

  public /*virtual*/ isPickedOnEdge(md: number, margin: number) { return Math.abs(this.md - md) <= margin; }

  //==================================================
  // STATIC METHODS
  //==================================================

  public static compareMd(a: MdSample, b: MdSample): number { return Ma.compare(a.md, b.md); }
}  
