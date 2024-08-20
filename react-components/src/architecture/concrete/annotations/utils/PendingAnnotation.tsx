/*!
 * Copyright 2024 Cognite AS
 */

import { type Matrix4, Box3 } from 'three';

import { type PointCloudAnnotation } from './types';

import { getSingleAnnotationGeometry } from './annotationGeometryUtils';
import { CUBE_CORNERS } from './getBoundingBox';

export class PendingAnnotation {
  matrix: Matrix4;
  public annotation: PointCloudAnnotation | undefined;

  public constructor(matrix: Matrix4, annotation: PointCloudAnnotation | undefined = undefined) {
    this.matrix = matrix;
    this.annotation = annotation;
  }

  public getBoundingBox(): Box3 {
    const boundingBox = new Box3().makeEmpty();
    for (const corner of CUBE_CORNERS) {
      const copyOfCorner = corner.clone();
      copyOfCorner.applyMatrix4(this.matrix);
      boundingBox.expandByPoint(copyOfCorner);
    }
    return boundingBox;
  }

  public getCdfMatrix(globalMatrix: Matrix4): Matrix4 {
    const matrix = this.matrix.clone();
    matrix.premultiply(globalMatrix);
    matrix.transpose();
    return matrix;
  }

  public get isCylinder(): boolean {
    if (this.annotation === undefined) {
      return false;
    }
    const geometry = getSingleAnnotationGeometry(this.annotation);
    if (geometry === undefined) {
      return false;
    }
    return geometry.cylinder !== undefined;
  }
}
