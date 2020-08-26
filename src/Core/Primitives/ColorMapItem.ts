/* eslint-disable no-lonely-if */
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

import * as Color from "color";
import { ColorInterpolation } from "@/Core/Primitives/ColorInterpolation";

export class ColorMapItem
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  public color: Color;
  public fraction: number;
  public interpolation: ColorInterpolation;

  //==================================================
  // CONSTRUCTOR
  //==================================================

  constructor(color: Color, value: number, interpolation: ColorInterpolation)
  {
    this.color = color;
    this.fraction = value;
    this.interpolation = interpolation;
  }

  //==================================================
  // INSTANCE METHODS
  //==================================================

  public mix(other: ColorMapItem, value: number): Color
  {
    const value2 = (value - this.fraction) / (other.fraction - this.fraction);
    const value1 = 1 - value2;

    if (this.interpolation === ColorInterpolation.Rgb)
    {
      const r1 = this.color.red();
      const g1 = this.color.green();
      const b1 = this.color.blue();

      const r2 = other.color.red();
      const g2 = other.color.green();
      const b2 = other.color.blue();

      const r = r1 * value1 + r2 * value2;
      const g = g1 * value1 + g2 * value2;
      const b = b1 * value1 + b2 * value2;

      return Color.rgb(r, g, b);
    }
    {
      const h1 = this.color.hue();
      const s1 = this.color.saturationv();
      const v1 = this.color.value();

      let h2 = other.color.hue();
      const s2 = other.color.saturationv();
      const v2 = other.color.value();

      if (this.interpolation === ColorInterpolation.HsvMax)
      {
        if (h1 < h2)
        {
          if (h2 - h1 < 180)
            h2 -= 360;
        }
        else
        {
          if (h1 - h2 < 180)
            h2 += 360;
        }
      }
      else
      {
        if (h1 < h2)
        {
          if (h2 - h1 > 180)
            h2 -= 360;
        }
        else
        {
          if (h1 - h2 > 180)
            h2 += 360;
        }
      }
      const h = h1 * value1 + h2 * value2;
      const s = s1 * value1 + s2 * value2;
      const v = v1 * value1 + v2 * value2;
      return Color.hsv(h, s, v).rgb();
    }
  }
}
