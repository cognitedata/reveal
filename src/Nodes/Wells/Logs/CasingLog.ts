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
import { CasingLogSample } from "@/Nodes/Wells/Samples/CasingLogSample";
import { BaseLog } from "@/Nodes/Wells/Logs/BaseLog";

export class CasingLog extends BaseLog
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  private _radiusRange: Range1 | undefined;
  
  //==================================================
  // INSTANCE METHODS: Getters
  //==================================================

  public getAt(index: number): CasingLogSample { return this.samples[index] as CasingLogSample; }

  //==================================================
  // INSTANCE METHODS: Range
  //==================================================

  public get radiusRange(): Range1
  {
    if (!this._radiusRange)
      this._radiusRange = this.calculateRadiusRange();
    return this._radiusRange;
  }

  public calculateRadiusRange(): Range1
  {
    const range = new Range1();
    this.expandRadiusRange(range);
    return range;
  }

  public touch(): void
  {
    super.touch();
    this._radiusRange = undefined;
  }

  public expandRadiusRange(range: Range1): void
  {
    for (let i = this.length - 1; i >= 0; i--)
    {
      const sample = this.getAt(i);
      if (sample.isMdEmpty || sample.isEmpty)
        continue;

      range.add(sample.radius);
    }
  }

  //==================================================
  // INSTANCE METHODS: Operations
  //==================================================

  public static createByRandom(mdRange: Range1, numSamples: number): CasingLog
  {
    const log = new CasingLog();
    let mdInc = mdRange.delta / (numSamples - 1);
    mdInc = Random.getGaussian(mdInc, mdInc / 10);

    for (let k = 0, md = mdRange.min; k < numSamples; k++, md += mdInc)
    {
      const radius = (numSamples - k) * 15 / numSamples;
      log.samples.push(new CasingLogSample(radius, md));
    }
    return log;
  }
}
