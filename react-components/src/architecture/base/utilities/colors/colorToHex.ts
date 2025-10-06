import { clamp } from 'lodash';
import { type Color } from 'three';

export function colorToHex(color: Color, opacity: number = 1): string {
  if (opacity >= 1) {
    return '#' + color.getHexString().toUpperCase();
  }
  return '#' + color.getHexString().toUpperCase() + opacityFractionToHex(opacity);
}

function opacityFractionToHex(opacity: number): string {
  // Ensure opacity is within the 0-1 range
  const clampedOpacity = clamp(opacity, 0, 1);

  // Convert to a 0-255 integer
  const alphaValue = Math.round(clampedOpacity * 255);

  // Convert to hexadecimal and pad with a leading zero if needed
  return alphaValue.toString(16).toUpperCase().padStart(2, '0');
}
