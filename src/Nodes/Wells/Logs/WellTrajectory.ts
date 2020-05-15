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

import { Vector3 } from "../../../Core/Geometry/Vector3";
import { Random } from "../../../Core/PrimitiveClasses/Random";
import { Range3 } from "../../../Core/Geometry/Range3";
import { Range1 } from "../../../Core/Geometry/Range1";
import { TrajectorySample } from "./../Samples/TrajectorySample";
import { MdSample } from "./../Samples/MdSample";
import { MdSamples } from "./MdSamples";
import { Ma } from "../../../Core/PrimitiveClasses/Ma";

export class WellTrajectory extends MdSamples
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  public kb = 0;

  //==================================================
  // INSTANCE METHODS: Getters
  //==================================================

  public getZRange(): Range1
  {
    const range: Range1 = new Range1();
    this.expandZRange(range);
    return range;
  }

  public getRange(): Range3
  {
    const range: Range3 = new Range3();
    this.expandRange(range);
    return range;
  }

  //==================================================
  // INSTANCE METHODS: Getters
  //==================================================

  public getAtMd(md: number): Vector3
  {
    const maxIndex = this.samples.length - 1;
    if (maxIndex < 0)
      return Vector3.newEmpty;

    if (md < this.samples[0].md || this.samples[maxIndex].md < md)
      return Vector3.newEmpty;

    let index = this.binarySearch(md);
    if (index >= 0)
    {
      const sample = this.samples[index] as TrajectorySample;
      return sample.point;
    }
    index = ~index;

    const minSample = this.samples[index - 1] as TrajectorySample;
    if (Ma.isEqual(md, minSample.md))
      return minSample.point;

    const maxSample = this.samples[index] as TrajectorySample;
    if (Ma.isEqual(md, maxSample.md))
      return maxSample.point;

    const remainder = (md - minSample.md) / (maxSample.md - minSample.md);
    const minPoint = minSample.point.copy();
    const maxPoint = maxSample.point.copy();

    minPoint.multiplyByNumber(1 - remainder);
    maxPoint.multiplyByNumber(remainder);
    minPoint.add(maxPoint);
    return minPoint;
  }

  public getTangentAtMd(md: number): Vector3
  {
    const maxIndex = this.samples.length - 1;
    if (maxIndex < 0)
      return Vector3.newEmpty;

    let index0: number, index1: number;
    if (md <= this.samples[0].md)
    {
      index0 = 0;
      index1 = 1;

    }
    else if (md >= this.samples[maxIndex].md)
    {
      index0 = maxIndex - 1;
      index1 = maxIndex;
    }
    else
    {
      index0 = this.getClosestIndexAtMd(md);
      index1 = index0;
      if (index0 === 0)
      {
        index1++;
      }
      else if (index0 === maxIndex)
      {
        index0--;
      }
      else
      {
        index0--;
        index1++;
      }
    }
    if (index0 >= index1)
      Error("Index rrror in tangent");

    const minSample = this.samples[index0] as TrajectorySample;
    const maxSample = this.samples[index1] as TrajectorySample;

    // Should pointing upwards
    const tangent = minSample.point.copy();
    tangent.substract(maxSample.point);
    tangent.normalize();

    if (tangent.z < 0)
      Error("Direction error in tangent");

    return tangent;
  }

  //==================================================
  // INSTANCE METHODS: Operations
  //==================================================

  public expandZRange(range: Range1): void
  {
    for (const baseSample of this.samples) 
    {
      const sample = baseSample as TrajectorySample;
      if (sample)
        range.add(sample.point.z);
    }
  }

  public expandRange(range: Range3): void
  {
    for (const baseSample of this.samples) 
    {
      const sample = baseSample as TrajectorySample;
      if (sample)
        range.add(sample.point);
    }
  }

  //==================================================
  // STATIC METHODS: 
  //==================================================

  public static createByRandom(wellHead: Vector3): WellTrajectory
  {
    const result = new WellTrajectory();
    const p0 = wellHead.copy();
    const p1 = p0.copy();
    p1.z += -800;

    const p2 = p1.copy();
    p2.x += Random.getFloat(new Range1(200, -100));
    p2.y += Random.getFloat(new Range1(200, -100));
    p2.z += -400;

    const p3 = p2.copy();
    p3.x += Random.getFloat(new Range1(600, -600));
    p3.y += Random.getFloat(new Range1(600, -600));
    p3.z += -300;

    let md = 0;
    result.add(new TrajectorySample(p0, md));
    md += p0.distance(p1);
    result.add(new TrajectorySample(p1, md));
    md += p1.distance(p2);
    result.add(new TrajectorySample(p2, md));
    md += p1.distance(p2);
    result.add(new TrajectorySample(p3, md));
    return result;
  }



}
