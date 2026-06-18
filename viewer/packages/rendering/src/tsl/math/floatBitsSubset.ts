/*!
 * Copyright 2026 Cognite AS
 */

import { Fn, floor, float, mod } from 'three/tsl';

export const floatBitsSubset = Fn(([value, from, to]) => {
  const divisor = float(2).pow(to.sub(from));
  return mod(floor(value.div(divisor)), float(2).pow(to.sub(from)));
});
