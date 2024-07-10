/*!
 * Copyright 2024 Cognite AS
 */
import { Color } from 'three';

export const DEFAULT_OVERLAY_COLOR = new Color('#3333AA');
export const PENDING_OVERLAY_COLOR = new Color('#33AA33');
export const PENDING_DELETION_OVERLAY_COLOR = new Color('#AA3333');

export function convertToSelectedColor(color: Color): Color {
  const hsl = { h: 0, s: 0, l: 0 };
  color.getHSL(hsl);
  hsl.l = Math.sqrt(hsl.l);
  return new Color().setHSL(hsl.h, hsl.s, hsl.l);
}
