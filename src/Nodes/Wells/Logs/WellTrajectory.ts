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

import * as THREE from 'three';
import { Vector3 } from "@/Core/Geometry/Vector3";
import { Random } from "@/Core/PrimitiveClasses/Random";
import { Range3 } from "@/Core/Geometry/Range3";
import { Range1 } from "@/Core/Geometry/Range1";
import { TrajectorySample } from "@/Nodes/Wells/Samples/TrajectorySample";
import { MdSamples } from "@/Nodes/Wells/Logs/MdSamples";
import { Ma } from "@/Core/PrimitiveClasses/Ma";
import { ThreeConverter } from "@/Three/ThreeConverter";

export class WellTrajectory extends MdSamples
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  private _range: Range3 | undefined;

  //==================================================
  // INSTANCE FIELDS
  //==================================================

  public kb = 0;

  //==================================================
  // INSTANCE METHODS: Range
  //==================================================

  public get range(): Range3
  {
    if (!this._range)
      this._range = this.calculateRange();
    return this._range;
  }

  public calculateRange(): Range3
  {
    const range = new Range3();
    this.expandRange(range);
    return range;
  }

  public touch(): void
  {
    super.touch();
    this._range = undefined;
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
    return Vector3.lerp(minSample.point, maxSample.point, remainder);
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
      Error("Index error in tangent");

    const minSample = this.samples[index0] as TrajectorySample;
    const maxSample = this.samples[index1] as TrajectorySample;

    // Should pointing upwards
    const tangent = Vector3.substract(minSample.point, maxSample.point);
    tangent.normalize();

    if (tangent.z < 0)
      Error("Direction error in tangent");

    return tangent;
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

    const points: THREE.Vector3[] = [];
    points.push(ThreeConverter.toVector(p0));
    points.push(ThreeConverter.toVector(p1));
    points.push(ThreeConverter.toVector(p2));
    points.push(ThreeConverter.toVector(p3));

    const curve = new THREE.CatmullRomCurve3(points);
    const curvePoints = curve.getPoints(64);

    let md = 0;
    let prevPoint = ThreeConverter.fromVector(curvePoints[0]);
    for (const curvePoint of curvePoints)
    {
      const point = ThreeConverter.fromVector(curvePoint);
      md += prevPoint.distance(point);
      result.add(new TrajectorySample(point, md));
      prevPoint = point;
    }
    return result;
  }

  //public getStartIndexAboveMd(md: number): number
  //{
  //  const maxIndex = this.samples.length - 1;
  //  if (maxIndex < 0)
  //    return -1;

  //  if (md < this.samples[0].md)
  //    return -1;

  //  if (this.samples[maxIndex].md < md)
  //    return maxIndex;

  //  const index = this.binarySearch(md);
  //  if (index >= 0)
  //    return index;

  //  return ~index;
  //}

  //public getNextIndexAboveMd(index: number, md: number): [number, Vector3]
  //{
  //  if (index < 0)
  //  {
  //    index = this.getStartIndexAboveMd(md);
  //    if (index < 0)
  //      return [-1, Vector3.newEmpty];
  //  }
  //  const maxIndex = this.samples.length - 1;
  //  if (index === maxIndex)
  //    return [Number.MAX_VALUE, Vector3.newEmpty];


  //  for (index + 1; index < maxIndex; index++)
  //  {
  //    const maxSample = this.samples[index] as TrajectorySample;
  //    if (md <= maxSample.md)
  //    {
  //      const minSample = this.samples[index - 1] as TrajectorySample;
  //      const remainder = (md - minSample.md) / (maxSample.md - minSample.md);
  //      return [index, Vector3.lerp(minSample.point, maxSample.point, remainder)];
  //    }
  //  }
  //  return [Number.MAX_VALUE, Vector3.newEmpty];
  //}


}
