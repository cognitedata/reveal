/*!
 * Copyright 2024 Cognite AS
 */

import { Color, type HSL } from 'three';

export const WHITE_COLOR = new Color(1, 1, 1);
export const BLACK_COLOR = new Color(0, 0, 0);
export const MAX_BYTE = 255;

export function getMixedColor(color: Color, other: Color, fraction = 0.5): Color {
  const otherFraction = 1 - fraction;
  const r = color.r * fraction + other.r * otherFraction;
  const g = color.g * fraction + other.g * otherFraction;
  const b = color.b * fraction + other.b * otherFraction;
  return new Color(r, g, b);
}

export function getHslMixedColor(color: Color, other: Color, fraction = 0.5, long: boolean): Color {
  let hsl1: HSL = { h: 0, s: 0, l: 0 };
  let hsl2: HSL = { h: 0, s: 0, l: 0 };
  hsl1 = color.getHSL(hsl1);
  hsl2 = other.getHSL(hsl2);

  if (long) {
    if (hsl1.h < hsl2.h) {
      if (hsl2.h - hsl1.h < 0.5) hsl2.h -= 1;
    } else {
      if (hsl1.h - hsl2.h < 0.5) hsl2.h += 1;
    }
  } else {
    if (hsl1.h < hsl2.h) {
      if (hsl2.h - hsl1.h > 0.5) hsl2.h -= 1;
    } else {
      if (hsl1.h - hsl2.h > 0.5) hsl2.h += 1;
    }
  }
  const otherFraction = 1 - fraction;
  const h = hsl1.h * fraction + hsl2.h * otherFraction;
  const s = hsl1.s * fraction + hsl2.s * otherFraction;
  const l = hsl1.l * fraction + hsl2.l * otherFraction;
  return new Color().setHSL(h, s, l);
}

export function getGammaCorrectedColor(color: Color, gamma = 2.2): Color {
  const r = color.r ** gamma;
  const g = color.g ** gamma;
  const b = color.b ** gamma;
  return new Color(r, g, b);
}

export function fractionToByte(fraction: number): number {
  return fraction * MAX_BYTE;
}

export function getColorFromBytes(r: number, g: number, b: number): Color {
  return new Color(r / MAX_BYTE, g / MAX_BYTE, b / MAX_BYTE);
}
