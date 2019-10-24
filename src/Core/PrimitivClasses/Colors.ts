
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

import * as Color from 'color'

const MaxByte = 255;

export class Colors
{
  //==================================================
  // FIELDS
  //==================================================

  public static get white(): Color { return Color.rgb(MaxByte, MaxByte, MaxByte) };
  public static get black(): Color { return Color.rgb(0, 0, 0) };
  public static get red(): Color { return Color.rgb(MaxByte, 0, 0) };
  public static get green(): Color { return Color.rgb(0, MaxByte, 0) };
  public static get blue(): Color { return Color.rgb(0, 0, MaxByte) };
  public static get yellow(): Color { return Color.rgb(MaxByte, MaxByte, 0) };
  public static get cyan(): Color { return Color.rgb(0, MaxByte, MaxByte) };
  public static get magenta(): Color { return Color.rgb(MaxByte, 0, MaxByte) };

  private static _index: number = 0;
  private static _colors: Color[] | null = null;

  //==================================================
  // PROPERTIES
  //==================================================

  private static get colors(): Color[]
  {
    if (!Colors._colors)
      Colors._colors = Colors.createDifferentColors(50);
    return Colors._colors;
  }

  public static get nextColor(): Color
  {
    const colors = this.colors;
    Colors._index = (Colors._index + 1) % colors.length;
    return colors[Colors._index];
  }

  //==================================================
  // STATIC METHODS
  //==================================================

  public static getNextColor(i: number): Color
  {
    const colors = this.colors;
    i = i % colors.length;
    return colors[i];
  }

  private static createDifferentColors(count: number): Color[]
  {
    let fraction = 0.5;
    const result: Color[] = [];
    const goldenRatioConjugate = 0.618033988749895;

    for (let i = 0; i < count; i++)
    {
      fraction += goldenRatioConjugate;
      fraction %= 1;

      const h = fraction * 360;
      const s = (i % 2) ? MaxByte : MaxByte * 0.67; // Brighter
      const v = (i % 2) ? MaxByte * 0.67 : MaxByte; // Brighter; // Darker
      result.push(Color.hsv(h, s, v));
    }
    return result;
  }
}

