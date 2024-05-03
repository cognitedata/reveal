/*!
 * Copyright 2024 Cognite AS
 */

import { type Color } from 'three';
import { ColorInterpolation } from './ColorInterpolation';
import { getHslMixedColor, getMixedColor } from './colorExtensions';

export class ColorMapItem {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public readonly color: Color;
  public fraction: number;
  private readonly _interpolation: ColorInterpolation;

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  constructor(color: Color, value: number, interpolation: ColorInterpolation) {
    this.color = color;
    this.fraction = value;
    this._interpolation = interpolation;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  public getMixed(other: ColorMapItem, value: number): Color {
    const fractionOfOther = (value - this.fraction) / (other.fraction - this.fraction);
    const fractionOfThis = 1 - fractionOfOther;

    if (this._interpolation === ColorInterpolation.Rgb) {
      return getMixedColor(this.color, other.color, fractionOfThis);
    }
    const long = this._interpolation === ColorInterpolation.HsvMax;
    return getHslMixedColor(this.color, other.color, fractionOfThis, long);
  }
}
