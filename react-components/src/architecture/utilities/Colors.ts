/*!
 * Copyright 2024 Cognite AS
 */

import { Color } from 'three';
import { isEven } from './math';

let index = 0;
let colors: Color[] | undefined;

export function getNextColor(): Color {
  const colors = getColors();
  index = (index + 1) % colors.length;
  return colors[index];
}

export function getNextColorByIndex(index: number): Color {
  const colors = getColors();
  const pointer = index % colors.length;
  return colors[pointer];
}

function getColors(): Color[] {
  if (colors === undefined) {
    colors = createDifferentColors(50);
  }
  return colors;
}

function createDifferentColors(count: number): Color[] {
  // This function make diffedrent colors
  const goldenRatioConjugate = 0.618033988749895;
  const result: Color[] = [];
  let fraction = 0.5;
  for (let i = 0; i < count; i++) {
    fraction += goldenRatioConjugate;
    fraction %= 1;

    const h = fraction;
    const s = isEven(i) ? 0.67 : 1; // Brighter
    const l = isEven(i) ? 1 : 0.67; // Brighter && Darker

    const color = new Color();
    color.setHSL(h, s, l);
    result.push(color);
  }
  return result;
}

export function getGammaCorrected(color: Color, gamma = 2.2): Color {
  const r = color.r ** gamma;
  const g = color.g ** gamma;
  const b = color.b ** gamma;
  return new Color(r, g, b);
}
