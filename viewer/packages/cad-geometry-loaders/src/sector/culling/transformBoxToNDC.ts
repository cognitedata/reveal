/*!
 * Copyright 2021 Cognite AS
 */

import type { Camera } from 'three';
import { Box3 } from 'three';

import { visitBox3CornerPoints } from '@reveal/utilities';

export function transformBoxToNDC(box: Box3, camera: Camera, out?: Box3): Box3 {
  const transformedBox = out !== undefined ? out : new Box3();
  transformedBox.makeEmpty();

  visitBox3CornerPoints(box, corner => {
    corner.project(camera);
    transformedBox.expandByPoint(corner);
  });

  return transformedBox;
}
