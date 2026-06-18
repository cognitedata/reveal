/*!
 * Copyright 2026 Cognite AS
 */

import { Fn, abs, float, max, min, mix, step, vec3, vec4 } from 'three/tsl';

export const rgb2hsv = Fn(([c]) => {
  const K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
  const p = mix(vec4(c.y, c.z, K.w, K.z), vec4(c.z, c.y, K.x, K.y), step(c.b, c.g));
  const q = mix(vec4(p.x, p.y, p.w, c.r), vec4(c.r, p.y, p.z, p.x), step(p.x, c.r));
  const d = q.x.sub(min(q.w, q.y));
  const e = float(1.0e-10);
  return vec3(abs(q.z.add(q.w.sub(q.y).div(d.mul(6.0).add(e)))), d.div(q.x.add(e)), q.x);
});

export const hsv2rgb = Fn(([c]) => {
  const K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  const p = abs(c.x.mul(vec3(1.0)).add(K.xyz).fract().mul(6.0).sub(K.www));
  return c.z.mul(mix(vec3(K.x), p.sub(vec3(K.x)).clamp(0.0, 1.0), c.y));
});
