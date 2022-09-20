/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';

/**
 * Expects h,s,v to be between 0 and 1.
 * Returns r,g,b between 0 and 1
 * Adapted from https://stackoverflow.com/questions/17242144/javascript-convert-hsb-hsv-color-to-rgb-accurately
 */
function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0:
      return [v, t, p];
    case 1:
      return [q, v, p];
    case 2:
      return [p, v, t];
    case 3:
      return [p, q, v];
    case 4:
      return [t, p, v];
    case 5:
      return [v, p, q];
    default:
      return [0, 0, 0];
  }
}

export function createDistinctColors(count: number): THREE.Color[] {
  const result: THREE.Color[] = [];

  const hue_partition_size = 1.0 / count;
  for (let i = 0; i < count; i++) {
    const rgb = hsvToRgb(hue_partition_size * i, 1.0 - (i % 2) * 0.5, 1.0 - (i % 3) * 0.1);

    result.push(new THREE.Color(...rgb));
  }

  return result;
}
