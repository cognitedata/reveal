/*!
 * Copyright 2026 Cognite AS
 */

import { Fn, floor, float, mod, vec3 } from 'three/tsl';

export const packIntToColor = Fn(([number]) => {
  const r = floor(number.div(float(255).mul(255))).div(255);
  const g = mod(floor(number.div(255)), 255).div(255);
  const b = mod(number, 255).div(255);
  return vec3(r, g, b);
});
