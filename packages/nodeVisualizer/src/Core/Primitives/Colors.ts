//= ====================================================================================
// This code is part of the Reveal Viewer architecture, made by Nils Petter Fremming
// in October 2019. It is suited for flexible and customizable visualization of
// multiple dataset in multiple viewers.
//
// It is a C# to typescript port from the Modern Model architecture,
// based on the experience when building Petrel.
//
// NOTE: Always keep the code according to the code style already applied in the file.
// Put new code under the correct section, and make more sections if needed.
// Copyright (c) Cognite AS. All rights reserved.
//= ====================================================================================

import * as Color from "color";

export const MaxByte = 255;

export class Colors {
  //= =================================================
  // STATIC FIELDS
  //= =================================================

  private static index = 0;

  private static _colors: Color[] | null = null;

  //= =================================================
  // STATIC PROPERTIES: Predefined color for this system
  //= =================================================

  // Main colors
  public static get red(): Color { return Color.rgb(MaxByte, 0, 0); };

  public static get green(): Color { return Color.rgb(0, MaxByte, 0); };

  public static get blue(): Color { return Color.rgb(0, 0, MaxByte); };

  public static get yellow(): Color { return Color.rgb(MaxByte, MaxByte, 0); };

  public static get cyan(): Color { return Color.rgb(0, MaxByte, MaxByte); };

  public static get magenta(): Color { return Color.rgb(MaxByte, 0, MaxByte); };

  // Grey scale
  public static get black(): Color { return Colors.greyScale(0); };

  public static get veryDarkGrey(): Color { return Colors.greyScale(0.25); };

  public static get darkGrey(): Color { return Colors.greyScale(0.5); };

  public static get grey(): Color { return Colors.greyScale(0.667); };

  public static get lightGrey(): Color { return Colors.greyScale(0.75); };

  public static get white(): Color { return Colors.greyScale(1); };

  public static greyScale(scale: number): Color { return Color.rgb(scale * MaxByte, scale * MaxByte, scale * MaxByte); };

  // Other colors
  public static get transparent(): Color { return Color.rgb(0, 0, 0, 0); };

  public static get selectedEmissive(): Color { return Color.rgb(128, 128, 0); };

  public static get orange(): Color { return Color.rgb(MaxByte, 102, 0); };

  public static get nextColor(): Color {
    // Get a "random" color
    const { colors } = this;
    Colors.index = (Colors.index + 1) % colors.length;
    return colors[Colors.index];
  }

  //= =================================================
  // STATIC PROPERTIES: Get colors
  //= =================================================

  private static get colors(): Color[] {
    if (!Colors._colors)
      Colors._colors = Colors.createDifferentColors(50);
    return Colors._colors;
  }

  //= =================================================
  // STATIC METHODS
  //= =================================================

  public static getNextColor(index: number): Color {
    // Get a "random" color
    const { colors } = this;
    const pointer = index % colors.length;

    return colors[pointer];
  }

  private static createDifferentColors(count: number): Color[] {
    // This function make diffedrent colors
    const goldenRatioConjugate = 0.618033988749895;
    const result: Color[] = [];
    let fraction = 0.5;
    for (let i = 0; i < count; i++) {
      fraction += goldenRatioConjugate;
      fraction %= 1;

      const h = fraction * 360;
      const s = (i % 2) ? MaxByte : MaxByte * 0.67; // Brighter
      const v = (i % 2) ? MaxByte * 0.67 : MaxByte; // Brighter && Darker
      result.push(Color.hsv(h, s, v));
    }
    return result;
  }

  public static getGammaCorrected(color: Color, gamma = 2.2): Color {
    let r = color.red() / MaxByte;
    let g = color.green() / MaxByte;
    let b = color.blue() / MaxByte;

    r **= gamma;
    g **= gamma;
    b **= gamma;

    r = Math.round(MaxByte * r);
    g = Math.round(MaxByte * g);
    b = Math.round(MaxByte * b);

    return Color.rgb(r, g, b);
  }
}
