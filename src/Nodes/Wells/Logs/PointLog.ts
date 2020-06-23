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

import { PointLogSample } from "@/Nodes/Wells/Samples/PointLogSample";
import { BaseLog } from "@/Nodes/Wells/Logs/BaseLog";

export class PointLog extends BaseLog
{
  //==================================================
  // INSTANCE METHODS: Getter
  //==================================================

  public getAt(index: number): PointLogSample { return this.samples[index] as PointLogSample; }

  //==================================================
  // INSTANCE METHODS: Operations
  //==================================================

  public static createByRandom(mdRange: Range1, numSamples: number): PointLog
  {
    const log = new PointLog();

    // Add some samples
    for (let i = 0; i < numSamples; i++)
    {
      const md = Random.getFloat(mdRange);
      log.samples.push(new PointLogSample(``, md));
    }
    log.sortByMd();

    // Set in the labels so they are in order
    var all = "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut";
    var descriptions = all.split(' ');
    for (let k = 0; k < log.samples.length; k++)
    {
      let description = "";
      const p = Random.getFloat2(0.2, 1);
      for (let i = 0; i < descriptions.length; i++)
      {
        if (!Random.isTrue(p))
          continue;

        if (description.length > 0)
          description += " "
        description += descriptions[i];
      }
      log.getAt(k).decription = description;
    }
    return log;
  }
}  
