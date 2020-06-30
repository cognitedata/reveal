
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

export class Random
{
  //==================================================
  // STATIC METHODS: 
  //==================================================

  public static getInt(range: Range1): number
  {
    return Random.getInt2(range.min, range.max);
  }

  public static getInt2(min: number, max: number): number
  {
    return Math.round(min - 0.499999 + Math.random() * (max - min + 0.99999));
  }

  public static getFloat(range: Range1): number
  {
    return range.getValue(Math.random());
  }

  public static getFloat2(min: number, max: number): number
  {
    return min + Math.random() * (max - min);
  }

  public static isTrue(probability: number = 0.5): boolean
  {
    return Math.random() < probability;
  }

  public static getGaussian(mean = 0, stdDev = 1): number
  {
    for (; ;)
    {
      const a = Math.random();
      if (a <= Number.EPSILON)
        continue;

      const b = Math.random();
      if (b <= Number.EPSILON)
        continue;

      const gausian = Math.sqrt(-2 * Math.log(a)) * Math.cos(2 * Math.PI * b);
      return gausian * stdDev + mean;
    }
  }
}

