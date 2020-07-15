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

import { Vector3 } from "@/Core/Geometry/Vector3";
import { MdSample } from "@/SubSurface/Wells/Samples/MdSample";
import { Ma } from '@/Core/Primitives/Ma';

export class TrajectorySample extends MdSample 
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  public point: Vector3;
  public inclination = 0;
  public azimuth = 0;

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(point: Vector3, md = 0)
  {
    super(md);
    this.point = point.clone();
  }

  //==================================================
  // OVERRIDES from MdSample
  //==================================================

  public /*override*/ toString(): string { return `${super.toString()} Point: ${this.point}`; }
  public /*override*/ getSampleText(): string { return this.point.toString(); }

  //==================================================
  // INSTANCE METHODS
  //==================================================

  public updateMdFromPrevSample(prevSample: TrajectorySample): void
  {
    this.md = prevSample.md + prevSample.point.distance(this.point);
  }

  public updatePointFromPrevSample(prevSample: TrajectorySample): boolean
  {
    const a1 = Ma.toRad(prevSample.azimuth);
    const a2 = Ma.toRad(this.azimuth);
    const i1 = Ma.toRad(prevSample.inclination);
    const i2 = Ma.toRad(this.inclination);

    // http://www.drillingformulas.com/minimum-curvature-method/
    // Code take from https://gis.stackexchange.com/questions/13484/how-to-convert-distance-azimuth-dip-to-xyz

    const deltaMd = this.md - prevSample.md;
    const b = Math.acos(Math.cos(i2 - i1) - (Math.sin(i1) * Math.sin(i2) * (1 - Math.cos(a2 - a1))));
    const rf = Math.abs(b) < 0.00001 ? 1 : 2 / b * Math.tan(b / 2);
    const a = rf * deltaMd / 2;
    const c = Math.sin(i1) * Math.sin(a1);

    const dx = a * (c + Math.sin(i2) * Math.sin(a2));
    const dy = a * (c + Math.sin(i2) * Math.cos(a2));
    const dz = a * (Math.cos(i1) + Math.cos(i2));

    if (Number.isNaN(dx))
      return false;
    if (Number.isNaN(dy))
      return false;
    if (Number.isNaN(dz))
      return false;

    const prevPoint = prevSample.point;
    this.point.x = prevPoint.x + dx;
    this.point.y = prevPoint.y + dy;
    this.point.z = prevPoint.z - dz;
    return true;
  }
}  
