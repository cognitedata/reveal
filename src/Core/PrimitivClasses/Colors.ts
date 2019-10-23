
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

export class Colors
{
  //==================================================
  // FIELDS
  //==================================================

  private static _index: number = 0;
  private static _colors: Color[] | null = null;

  //==================================================
  // PROPERTIES
  //==================================================

  private static get colors(): Color[]
  {
    let colors = this._colors;
    if (!colors)
      colors = Colors._colors = Colors.createSomeColors();
    return colors;
  }

  public static get nextColor(): Color
  {
    const colors = this.colors;
    Colors._index = (Colors._index + 1) % colors.length;
    return colors[Colors._index];
  }

  //==================================================
  // STATIOC METHODS
  //==================================================

  public static getNextColor(i: number): Color
  {
    const colors = this.colors;
    i = i % colors.length;
    return colors[i];
  }

  private static createSomeColors(): Color[]
  {
    let hue = 0.5;
    const result: Color[] = [];
    const goldenRatioConjugate = 0.618033988749895;

    for (let i = 0; i < 40; i++)
    {
      hue += goldenRatioConjugate;
      hue %= 1;
      const color = Color.hsv(hue * 255, 255, 200);
      result.push(color);
    }
    return result;
  }
}

