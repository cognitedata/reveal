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
import { Random } from "@/Core/Primitives/Random";

import { BaseLogSample } from "@/SubSurface/Wells/Samples/BaseLogSample";
import { DiscreteLogSample } from "@/SubSurface/Wells/Samples/DiscreteLogSample";
import { BaseLog } from "@/SubSurface/Wells/Logs/BaseLog";

export class DiscreteLog extends BaseLog
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  private _range: Range1 | undefined;

  //==================================================
  // OVERRIDES of BaseLog
  //==================================================

  public /*override*/ getSampleByMd(md: number): BaseLogSample | null
  {
    return this.getConcreteSampleByMd(md);
  }

  //==================================================
  // INSTANCE METHODS: Getter
  //==================================================

  public getAt(index: number): DiscreteLogSample { return this.samples[index] as DiscreteLogSample; }

  public getConcreteSampleByMd(md: number): DiscreteLogSample | null
  {
    const floatIndex = this.getFloatIndexAtMd(md);
    if (floatIndex < 0)
      return null;

    const index = Math.floor(floatIndex);
    return this.samples[index] as DiscreteLogSample;
  }

  //==================================================
  // INSTANCE METHODS: Range
  //==================================================

  public get range(): Range1
  {
    if (!this._range)
      this._range = this.calculateRange();
    return this._range;
  }

  public calculateRange(): Range1
  {
    const range = new Range1();
    this.expandRange(range);
    return range;
  }

  public touch(): void
  {
    super.touch();
    this._range = undefined;
  }

  public expandRange(range: Range1): void
  {
    for (let i = this.samples.length - 1; i >= 0; i--)
    {
      const sample = this.getAt(i);
      if (sample.isMdEmpty || sample.isEmpty)
        continue;

      range.add(sample.value);
    }
  }

  //==================================================
  // INSTANCE METHODS: Operations
  //==================================================

  public static createByRandom(mdRange: Range1, valueRange: Range1): DiscreteLog
  {
    const log = new DiscreteLog();
    const numSamples = 20;

    for (let k = 0; k < numSamples; k++)
    {
      const md = Random.getFloat(mdRange);
      log.samples.push(new DiscreteLogSample(Random.getInt(valueRange), md));
    }
    log.sortByMd();
    return log;
  }

}  
