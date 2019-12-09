/*!
 * Copyright 2019 Cognite AS
 */

import { vec3, mat4 } from 'gl-matrix';
import { Box3 } from './Box3';

export function suggestCameraLookAt(bounds: Box3): [vec3, vec3] {
  // TODO 2019-12-08 larsmoa: Make something more decent
  const target = bounds.center;
  const extent = vec3.subtract(vec3.create(), bounds.max, bounds.min);
  const d = Math.max(extent[0], extent[1], extent[2]);
  const pos = vec3.add(vec3.create(), target, vec3.fromValues(0, -0.2 * extent[1], -1.2 * d));
  return [pos, target];
}
