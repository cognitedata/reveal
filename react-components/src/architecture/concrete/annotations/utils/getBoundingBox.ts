/*!
 * Copyright 2024 Cognite AS
 */

import * as THREE from 'three';

import { type PointCloudAnnotation } from './types';

import { getAnnotationGeometries } from './annotationGeometryUtils';
import { getAnnotationMatrixByGeometry } from './getMatrixUtils';

export const getBoundingBox = (
  annotation: PointCloudAnnotation,
  globalMatrix: THREE.Matrix4
): THREE.Box3 | undefined => {
  const boundingBox = new THREE.Box3().makeEmpty();
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
  new THREE.Vector3(-1, -1, -1),
  new THREE.Vector3(1, -1, -1),
  new THREE.Vector3(1, 1, -1),
  new THREE.Vector3(-1, 1, -1),
  new THREE.Vector3(-1, -1, 1),
  new THREE.Vector3(1, -1, 1),
  new THREE.Vector3(1, 1, 1),
  new THREE.Vector3(-1, 1, 1)
];
