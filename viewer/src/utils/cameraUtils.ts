/*!
 * Copyright 2019 Cognite AS
 */

import { vec3 } from 'gl-matrix';
import { Box3 } from './Box3';
import { SectorMetadata } from '../models/cad/types';
import { traverseDepthFirst } from './traversal';

export interface SuggestedCameraConfig {
  position: vec3;
  target: vec3;
  near: number;
  far: number;
}

export function suggestCameraConfig(rootSector: SectorMetadata): SuggestedCameraConfig {
  const averageMin = vec3.create();
  const averageMax = vec3.create();
  let count = 0;

  traverseDepthFirst(rootSector, node => {
    vec3.add(averageMin, averageMin, node.bounds.min);
    vec3.add(averageMax, averageMax, node.bounds.max);
    count += 1;
    return true;
  });

  vec3.scale(averageMin, averageMin, 1.0 / count);
  vec3.scale(averageMax, averageMax, 1.0 / count);

  const bounds = new Box3([averageMin, averageMax]);
  const target = bounds.center;
  const extent = vec3.subtract(vec3.create(), bounds.max, bounds.min);

  const position = vec3.add(
    vec3.create(),
    target,
    vec3.fromValues(-2.0 * extent[0], -2.0 * extent[1], 2.0 * extent[2])
  );
  return {
    position,
    target,
    near: 0.1,
    far: vec3.distance(position, target) * 6
  };
}
