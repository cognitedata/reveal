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
import { FloatLogSample } from "../Samples/FloatLogSample";
import { BaseLog } from "../Logs/BaseLog";
import { Range1 } from "../../../Core/Geometry/Range1";
import { Ma } from "../../../Core/PrimitiveClasses/Ma";
import { Random } from "../../../Core/PrimitiveClasses/Random";

export class FloatLog extends BaseLog
{
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

  public getRange(): Range1
  {
    const range = new Range1();
    this.expandRange(range);
    return range;
  }

  public getAt(index: number): FloatLogSample { return this.samples[index] as FloatLogSample; }

  public getConcreteSampleByMd(md: number): FloatLogSample | null
  {
    const floatIndex = this.getFloatIndexAtMd(md);
    if (floatIndex < 0)
      return null;

    const index = Math.floor(floatIndex);
    const remainder = floatIndex % 1;

    const minSample = this.samples[index] as FloatLogSample;
    if (Ma.isZero(remainder))
      return minSample;

    const maxSample = this.samples[index + 1] as FloatLogSample;
    if (Ma.isZero(remainder - 1))
      return maxSample;

    if (maxSample.isEmpty)
      return null;

    if (maxSample.isEmpty)
      return null;

    const value = minSample.value * (1 - remainder) + maxSample.value * remainder;
    return new FloatLogSample(value, md);
  }

  //==================================================
  // INSTANCE METHODS: Operations
  //==================================================

  public expandRange(range: Range1): void
  {
    for (const baseSample of this.samples) 
    {
      const sample = baseSample as FloatLogSample;
      if (sample)
        range.add(sample.value);
    }
  }

  //==================================================
  // INSTANCE METHODS: Operations
  //==================================================

  public static createByRandom(mdRange: Range1, valueRange: Range1): FloatLog
  {
    const log = new FloatLog();
    const numSamples = 100;
    const mdInc = mdRange.delta / (numSamples - 1);

    for (let k = 0, md = mdRange.min; k < numSamples; k++, md += mdInc)
      log.samples.push(new FloatLogSample(Random.getFloat(valueRange), md));
    return log;
  }
}  
