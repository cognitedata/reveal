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

import { Vector3 } from "../../Core/Geometry/Vector3";
import { Random } from "../../Core/PrimitiveClasses/Random";
import { Range3 } from "../../Core/Geometry/Range3";
import { Range1 } from "../../Core/Geometry/Range1";
import { WellSample } from "./Samples/WellSample";
import { BaseWellSample } from "./Samples/BaseWellSample";
import { Ma } from "../../Core/PrimitiveClasses/Ma";

export class WellTrajectory 
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  public kb = 0;
  public samples: WellSample[] = [];
  public get count(): number { return this.samples.length; }

  // For sorting and searching
  private readonly _seachSample = new WellSample(Vector3.newZero);

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

    this._seachSample.md = md;
    let index = Ma.binarySearch(this.samples, this._seachSample, BaseWellSample.compareMd);
    if (index >= 0)
      return this.samples[index].point.copy();

    index = ~index;

    const minSample = this.samples[index - 1];
    if (Ma.isEqual(md, minSample.md))
      return minSample.point;

    const maxSample = this.samples[index];
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

  //==================================================
  // INSTANCE METHODS: Operations
  //==================================================

  public add(sample: WellSample): void
  {
    this.samples.push(sample);
  }

  public sortByMd(): void
  {
    this.samples.sort(BaseWellSample.compareMd);
  }

  public expandZRange(range: Range1): void
  {
    for (const sample of this.samples)
      range.add(sample.point.z);
  }

  public expandRange(range: Range3): void
  {
    for (const sample of this.samples)
      range.add(sample.point);
  }

  //==================================================
  // STATIC METHODS: 
  //==================================================

  public static createByWellHead(wellHead: Vector3): WellTrajectory
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
    result.add(new WellSample(p0, md));
    md += p0.distance(p1);
    result.add(new WellSample(p1, md));
    md += p1.distance(p2);
    result.add(new WellSample(p2, md));
    md += p1.distance(p2);
    result.add(new WellSample(p3, md));
    return result;
  }



}
