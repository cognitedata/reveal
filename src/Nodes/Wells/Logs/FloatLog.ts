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
import { Random } from "@/Core/Primitives/Random";

import { BaseLogSample } from "@/Nodes/Wells/Samples/BaseLogSample";
import { FloatLogSample } from "@/Nodes/Wells/Samples/FloatLogSample";
import { BaseLog } from "@/Nodes/Wells/Logs/BaseLog";

export class FloatLog extends BaseLog
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
  // INSTANCE METHODS: Getters
  //==================================================

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
    for (let i = this.length - 1; i >= 0; i--)
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

  public static createByRandom(mdRange: Range1, valueRange: Range1): FloatLog
  {
    const log = new FloatLog();
    const numSamples = 500;
    const mdInc = mdRange.delta / (numSamples - 1);

    for (let k = 0, md = mdRange.min; k < numSamples; k++, md += mdInc)
    {
      const value = k % 10 === 0 ? Number.NaN : Random.getGaussian(valueRange.center, valueRange.delta);
      log.samples.push(new FloatLogSample(value, md));
    }
    return log;
  }

  public static createCasingByRandom(mdRange: Range1, numSamples: number): FloatLog
  {
    const log = new FloatLog();
    let mdInc = mdRange.delta / (numSamples - 1);
    mdInc = Random.getGaussian(mdInc, mdInc / 10);

    for (let k = 0, md = mdRange.min; k < numSamples; k++, md += mdInc)
    {
      const radius = (numSamples - k) * 15 / numSamples;
      log.samples.push(new FloatLogSample(radius, md));
    }
    return log;
  }
}
