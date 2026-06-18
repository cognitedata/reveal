/*!
 * Copyright 2026 Cognite AS
 */

import { Fn, cross, dFdx, dFdy, normalize, vec3 } from 'three/tsl';

export const derivateNormal = Fn(([viewPosition]) => {
  const fdx = vec3(dFdx(viewPosition.x), dFdx(viewPosition.y), dFdx(viewPosition.z));
  const fdy = vec3(dFdy(viewPosition.x), dFdy(viewPosition.y), dFdy(viewPosition.z));
  return normalize(cross(fdx, fdy));
});

export const packNormalToRgb = Fn(([normal]) => {
  return normalize(normal).mul(0.5).add(0.5);
});

export const packDepthToRGBA = Fn(([depth]) => {
  const v = depth.mul(255.0);
  const r = v.div(255.0 * 255.0 * 255.0).floor().div(255.0);
  const g = v.div(255.0 * 255.0).floor().mod(255.0).div(255.0);
  const b = v.div(255.0).floor().mod(255.0).div(255.0);
  const a = v.mod(255.0).div(255.0);
  return vec4(r, g, b, a);
});
