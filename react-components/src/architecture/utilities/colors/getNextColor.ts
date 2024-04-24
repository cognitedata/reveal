/*!
 * Copyright 2024 Cognite AS
 */

import { Color } from 'three';
import { isEven } from '../extensions/mathExtensions';

let currentIndex = 0;
let uniqueColors: Color[] | undefined;

const NUMBER_OF_UNIQUE_COLORS = 50;

// ==================================================
// PUBLIC FUNCTIONS:
// ==================================================

export function getNextColor(): Color {
  const colors = getUniqueColors();
  currentIndex = (currentIndex + 1) % colors.length;
  return colors[currentIndex];
}

export function getNextColorByIndex(index: number): Color {
  const colors = getUniqueColors();
  return colors[index % colors.length];
}

// ==================================================
// LOCAL FUNCTIONS:
// ==================================================

function getUniqueColors(): Color[] {
  if (uniqueColors === undefined) {
    uniqueColors = createUniqueColors(NUMBER_OF_UNIQUE_COLORS);
  }
  return uniqueColors;
}

function createUniqueColors(count: number): Color[] {
  // This function make different colors
  const CONJUGATE_OF_GOLDEN_RATIO = 0.618033988749895;
  const result: Color[] = [];
  let h = 0.5;
  for (let i = 0; i < count; i++) {
    h += CONJUGATE_OF_GOLDEN_RATIO;
    h %= 1;

    const s = isEven(i) ? 0.67 : 1; // Brighter
    const l = isEven(i) ? 1 : 0.67; // Brighter && Darker

    const color = new Color();
    color.setHSL(h, s, l);
    result.push(color);
  }
  return result;
}
