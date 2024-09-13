/*!
 * Copyright 2024 Cognite AS
 */

import { type PointCloudAnnotation } from './types';

import { getAnnotationGeometries } from './annotationGeometryUtils';
import { getAnnotationMatrixByGeometry } from '../helpers/getMatrixUtils';
import { Box3, Vector3, type Matrix4 } from 'three';
import { BoxUtils } from '../../../base/utilities/geometry/BoxUtils';
import { Range3 } from '../../../base/utilities/geometry/Range3';
import { CYLINDER_RADIUS_MARGIN } from './constants';

export const getBoundingBox = (
  annotation: PointCloudAnnotation,
  globalMatrix: Matrix4,
  cylinderMargin = CYLINDER_RADIUS_MARGIN
): Box3 | undefined => {
  const boundingBox = new Box3().makeEmpty();
  expandBoundingBox(boundingBox, annotation, globalMatrix, cylinderMargin);
  return boundingBox.isEmpty() ? undefined : boundingBox;
};

export function expandBoundingBox(
  boundingBox: Box3,
  annotation: PointCloudAnnotation,
  globalMatrix: Matrix4,
  cylinderMargin = CYLINDER_RADIUS_MARGIN
): void {
  for (const geometry of getAnnotationGeometries(annotation)) {
    if (geometry.box !== undefined) {
      const matrix = getAnnotationMatrixByGeometry(geometry, cylinderMargin);
      if (matrix === undefined) {
        continue;
      }
      matrix.premultiply(globalMatrix);
      BoxUtils.expandBoundingBox(boundingBox, matrix);
    } else if (geometry.cylinder !== undefined) {
      const centerA = new Vector3(...geometry.cylinder.centerA);
      const centerB = new Vector3(...geometry.cylinder.centerB);
      const radius = geometry.cylinder.radius * (1 + cylinderMargin);

      centerA.applyMatrix4(globalMatrix);
      centerB.applyMatrix4(globalMatrix);

      const axis = new Vector3().subVectors(centerB, centerA).normalize();
      const range = new Range3(centerA, centerB);
      range.expandByMargin3(Range3.getCircleRangeMargin(axis, radius));

      boundingBox.union(range.getBox());
    }
  }
}
