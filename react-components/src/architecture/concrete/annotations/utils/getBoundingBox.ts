/*!
 * Copyright 2024 Cognite AS
 */

import { type PointCloudAnnotation } from './types';

import { getAnnotationGeometries } from './annotationGeometryUtils';
import { getAnnotationMatrixByGeometry } from './getMatrixUtils';
import { Box3, type Matrix4 } from 'three';
import { expandBoundingBoxForBox } from '../../../base/utilities/box/createBoxGeometry';

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
    expandBoundingBoxForBox(boundingBox, matrix);
  }
  return boundingBox.isEmpty() ? undefined : boundingBox;
};
