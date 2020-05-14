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

import { BaseLogSample } from "../Samples/BaseLogSample";
import { BaseWellSample } from "../Samples/BaseWellSample";
import { FloatLogSample } from "../Samples/FloatLogSample";
import { Range1 } from "../../../Core/Geometry/Range1";
import { Ma } from "../../../Core/PrimitiveClasses/Ma";

export abstract class BaseLog
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  public samples: BaseLogSample[] = [];

  // For sorting and searching
  private readonly _seachSample = new FloatLogSample(0, 0);

  //==================================================
  // VIRTUAL METHODS
  //==================================================

  public /*virtual*/ getSampleByMd(md: number): BaseLogSample | null
  {
    Error("Illegal usage for this type of log");
    return null;
  }

  //==================================================
  // INSTANCE METHODS: Getter
  //==================================================

  public getMdRange(): Range1
  {
    const range = new Range1();
    this.expandMdRange(range);
    return range;
  }

  public getAt(index: number): BaseLogSample { return this.samples[index]; }

  public getClosestIndexAtMd(md: number): number
  {
    const index = this.getFloatIndexAtMd(md);
    if (index < 0)
      return - 1;
    return Math.round(index);
  }

  public getFloatIndexAtMd(md: number): number
  {
    const maxIndex = this.samples.length - 1;
    if (maxIndex < 0)
      return -1;

    if (md < this.samples[0].md || this.samples[maxIndex].md < md)
      return -1;

    this._seachSample.md = md;
    let index = Ma.binarySearch(this.samples, this._seachSample, BaseWellSample.compareMd);
    if (index >= 0)
      return index;

    index = ~index;

    const minSample = this.samples[index - 1];
    if (Ma.isEqual(md, minSample.md))
      return index - 1;

    const maxSample = this.samples[index];
    if (Ma.isEqual(md, maxSample.md))
      return index;

    const remainder = (md - minSample.md) / (maxSample.md - minSample.md);
    return index - 1 + remainder;
  }

  //==================================================
  // INSTANCE METHODS: Operations
  //==================================================

  public sortByMd(): void
  {
    this.samples.sort(BaseWellSample.compareMd);
  }

  public expandMdRange(range: Range1): void
  {
    for (const sample of this.samples)
      range.add(sample.md);
  }
}  
