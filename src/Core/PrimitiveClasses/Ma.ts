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

export class Ma
{
  public static errorTolerance = 1.0E-10;

  //==================================================
  // STATIC METHODS: Returning boolean
  //==================================================

  public static isZero(x: number): boolean { return x < 0 ? x > -Ma.errorTolerance : x < Ma.errorTolerance; }

  public static isInt(value: number): boolean
  {
    const diff = Math.round(value) - value;
    return Ma.isZero(diff);
  }

  public static isInc(tick: number, inc: number): boolean { return Ma.isInt(tick / inc); }

  //==================================================
  // STATIC METHODS: 
  //==================================================

  public static sign(value: number): number { return value < 0 ? -1 : 1; }
  public static square(value: number): number { return value * value; }

  public static roundInc(inc: number): number
  {
    // Get the exponent for the number [1-10] and scale the inc so the number is between 1 and 10.
    let exp = 0;
    let found = false;
    for (let i = 0; i < 100; i++)
    {
      if (inc < 1)
      {
        exp--;
        inc *= 10;
      }
      else if (inc > 10)
      {
        exp++;
        inc /= 10;
      }
      else
      {
        found = true;
        break;
      }
    }
    if (!found)
      return Number.NaN;

    // Now round it
    if (inc < 2)
      inc = 2;
    else if (inc < 2.5)
      inc = 2.5;
    else if (inc < 5)
      inc = 5;
    else
      inc = 10;

    // Upscale the inc to the real number
    if (exp < 0)
    {
      for (; exp !== 0; exp++)
        inc /= 10;
    }
    else
    {
      for (; exp !== 0; exp--)
        inc *= 10;
    }
    return inc;
  }

  public static ceil(value: number, delta: number): number
  {
    // Rounding number up to nearest delta
    value /= delta;
    value = Math.ceil(value);
    value *= delta;
    return value;
  }

  public static floor(value: number, delta: number): number
  {
    // Rounding number down to nearest delta
    value /= delta;
    value = Math.floor(value);
    value *= delta;
    return value;
  }
}

