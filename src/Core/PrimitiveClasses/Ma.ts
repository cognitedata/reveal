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
  //==================================================
  // STATIC METHODS: 
  //==================================================

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
}

