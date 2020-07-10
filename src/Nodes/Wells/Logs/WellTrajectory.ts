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

import * as THREE from "three";
import * as Color from "color"

import { Vector3 } from "@/Core/Geometry/Vector3";
import { Range1 } from "@/Core/Geometry/Range1";
import { Range3 } from "@/Core/Geometry/Range3";
import { Random } from "@/Core/Primitives/Random";
import { Ma } from "@/Core/Primitives/Ma";

import { ThreeConverter } from "@/Three/Utilities/ThreeConverter";

import { TrajectorySample } from "@/Nodes/Wells/Samples/TrajectorySample";
import { MdSamples } from "@/Nodes/Wells/Logs/MdSamples";
import { RenderSample } from "@/Nodes/Wells/Samples/RenderSample";
import { LineSegment } from '@/Core/Geometry/LineSeg3';

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

  public getAt(index: number): TrajectorySample { return this.samples[index] as TrajectorySample; }
  public getPositionAt(i: number): Vector3 { return this.getAt(i).point; }
  public getTopPosition(): Vector3 { return this.getAt(0).point; }
  public getBasePosition(): Vector3 { return this.getAt(this.length - 1).point; }

  public getPositionAtMd(md: number, result: Vector3): boolean
  {
    const maxIndex = this.samples.length - 1;
    if (maxIndex < 0)
      false;

    if (md < this.samples[0].md || this.samples[maxIndex].md < md)
      return false;

    let index = this.binarySearch(md);
    if (index >= 0)
    {
      const sample = this.samples[index] as TrajectorySample;
      result.copy(sample.point);
      return true;
    }
    index = ~index;

    const minSample = this.samples[index - 1] as TrajectorySample;
    if (Ma.isEqual(md, minSample.md))
    {
      result.copy(minSample.point);
      return true;
    }
    const maxSample = this.samples[index] as TrajectorySample;
    if (Ma.isEqual(md, maxSample.md))
    {
      result.copy(maxSample.point);
      return true;
    }
    const remainder = (md - minSample.md) / (maxSample.md - minSample.md);
    result.lerp(minSample.point, maxSample.point, remainder);
    return true;
  }

  public getTangentAtMd(md: number, result: Vector3): boolean
  {
    const maxIndex = this.samples.length - 1;
    if (maxIndex < 0)
      return false;

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
    {
      Error("Index error in tangent");
      return false;
    }
    const minSample = this.samples[index0] as TrajectorySample;
    const maxSample = this.samples[index1] as TrajectorySample;

    // Should normally pointing upwards
    result.copy(minSample.point);
    result.substract(maxSample.point);
    result.normalize();
    return true;
  }

  public getTangentAt(i: number, result: Vector3): boolean
  {
    let index0: number, index1: number;
    if (i == 0)
    {
      index0 = 0;
      index1 = 1;

    }
    else if (i >= this.samples.length - 1)
    {
      index0 = this.samples.length - 2;
      index1 = this.samples.length - 1;
    }
    else
    {
      index0 = i - 1;
      index1 = i + 1;
    }
    if (index0 >= index1)
    {
      Error("Index error in tangent");
      return false;
    }
    const minSample = this.samples[index0] as TrajectorySample;
    const maxSample = this.samples[index1] as TrajectorySample;

    // Should normally pointing upwards
    result.copy(minSample.point);
    result.substract(maxSample.point);
    result.normalize();
    return true;
  }

  public getClosestMd(position: Vector3): number
  {
    const lineSegment = new LineSegment();
    let closestPoint: Vector3 | null = null
    let closestDistance = Number.MAX_VALUE;
    let index = 0;

    for (let i = 0; i < this.length - 1; i++)
    {
      const min = this.getPositionAt(i);
      const max = this.getPositionAt(i + 1);

      lineSegment.set(min, max);

      const point = lineSegment.getClosest(position);
      const distance = position.distance(point);
      if (distance < closestDistance)
      {
        index = i;
        closestPoint = point;
        closestDistance = distance;
      }
    }
    if (!closestPoint)
      return Number.NaN;

    const minSample = this.getAt(index);
    const maxSample = this.getAt(index + 1);

    const minDistance = minSample.point.distance(closestPoint);
    if (Ma.isAbsEqual(minDistance, 0, 0.0001))
      return minSample.md;

    const maxDistance = maxSample.point.distance(closestPoint);
    if (Ma.isAbsEqual(maxDistance, 0, 0.0001))
      return maxSample.md;

    const totalDistance = minDistance + maxDistance;
    const minFraction = minDistance / totalDistance;
    const maxFraction = maxDistance / totalDistance;
    const md = maxFraction * minSample.md + minFraction * maxSample.md;
    return md
  }

  //==================================================
  // INSTANCE METHODS: Creators
  //==================================================

  public createRenderSamples(color: Color, radius: number): RenderSample[]
  {
    const samples: RenderSample[] = [];
    for (let i = 0; i < this.length; i++)
    {
      const sample = this.getAt(i);
      samples.push(new RenderSample(sample.point.clone(), sample.md, radius, color));
    }
    return samples;
  }

  //==================================================
  // STATIC METHODS: 
  //==================================================

  public static createByRandom(wellHead: Vector3): WellTrajectory
  {
    const trajectory = new WellTrajectory();
    const p0 = wellHead.clone();
    const p1 = p0.clone();
    p1.z += -800;

    const p2 = p1.clone();
    p2.x += Random.getFloat(new Range1(200, -100));
    p2.y += Random.getFloat(new Range1(200, -100));
    p2.z += -400;

    const p3 = p2.clone();
    p3.x += Random.getFloat(new Range1(600, -600));
    p3.y += Random.getFloat(new Range1(600, -600));
    p3.z += -300;

    const points: THREE.Vector3[] = [];
    points.push(ThreeConverter.to3D(p0));
    points.push(ThreeConverter.to3D(p1));
    points.push(ThreeConverter.to3D(p2));
    points.push(ThreeConverter.to3D(p3));

    const curve = new THREE.CatmullRomCurve3(points);
    const curvePoints = curve.getPoints(64);

    let md = 0;
    let prevPoint = ThreeConverter.toWorld(curvePoints[0]);
    for (const curvePoint of curvePoints)
    {
      const point = ThreeConverter.toWorld(curvePoint);
      md += prevPoint.distance(point);
      trajectory.add(new TrajectorySample(point, md));
      prevPoint = point;
    }
    return trajectory;
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
