/*!
 * Copyright 2024 Cognite AS
 */

import { type PointCloudAnnotation } from './types';

import { getAnnotationGeometries } from './annotationGeometryUtils';
import { getAnnotationMatrixByGeometry } from './getMatrixUtils';
import { Box3, type Matrix4, Vector3 } from 'three';

export const getBoundingBox = (
  annotation: PointCloudAnnotation,
  globalMatrix: Matrix4
): Box3 | undefined => {
  const boundingBox = new Box3().makeEmpty();
  for (const geometry of getAnnotationGeometries(annotation)) {
    const matrix = getAnnotationMatrixByGeometry(geometry);
    if (matrix === undefined) {
      continue;
    }
    matrix.premultiply(globalMatrix);
    for (const corner of CUBE_CORNERS) {
      const copyOfCorner = corner.clone();
      copyOfCorner.applyMatrix4(matrix);
      boundingBox.expandByPoint(copyOfCorner);
    }
  }
  return boundingBox.isEmpty() ? undefined : boundingBox;
};

export const CUBE_CORNERS = [
  new Vector3(-1, -1, -1),
  new Vector3(1, -1, -1),
  new Vector3(1, 1, -1),
  new Vector3(-1, 1, -1),
  new Vector3(-1, -1, 1),
  new Vector3(1, -1, 1),
  new Vector3(1, 1, 1),
  new Vector3(-1, 1, 1)
];
