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

import { Range1 } from "@/Core/Geometry/Range1";
import { Ma } from "@/Core/Primitives/Ma";

import { BaseLogSample } from "@/Nodes/Wells/Samples/BaseLogSample";
import { MdSample } from "@/Nodes/Wells/Samples/MdSample";

export abstract class MdSamples
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  public samples: MdSample[] = [];
  private _mdRange: Range1 | undefined;

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get length(): number { return this.samples.length; }
  public get firstSample(): MdSample | null { return this.samples.length > 0 ? this.samples[0] : null; }
  public get lastSample(): MdSample | null { return this.samples.length > 0 ? this.samples[this.samples.length - 1] : null; }

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

    let index = this.binarySearch(md);
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
  // INSTANCE METHODS: Md range
  //==================================================

  public get mdRange(): Range1
  {
    if (!this._mdRange)
      this._mdRange = this.calculateMdRange();
    return this._mdRange;
  }

  public calculateMdRange(): Range1
  {
    const range = new Range1();
    this.expandMdRange(range);
    return range;
  }

  public touch(): void
  {
    this._mdRange = undefined;
  }

  public expandMdRange(range: Range1): void
  {
    for (const sample of this.samples)
      if (!sample.isMdEmpty)
        range.add(sample.md);
  }

  //==================================================
  // INSTANCE METHODS: Operations
  //==================================================

  public add(sample: MdSample): void
  {
    this.samples.push(sample);
  }

  public sortByMd(): void
  {
    MdSamples.sortByMd(this.samples);
  }

  public static sortByMd(samples: MdSample[]): void
  {
    samples.sort(MdSample.compareMd);
  }

  protected binarySearch(md: number): number
  {
    const seachSample = new MdSample(md);
    return Ma.binarySearch(this.samples, seachSample, MdSample.compareMd);
  }
}  
