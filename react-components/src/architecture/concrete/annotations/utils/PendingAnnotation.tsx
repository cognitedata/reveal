/*!
 * Copyright 2024 Cognite AS
 */

import { type Matrix4, type Box3 } from 'three';
import { type PointCloudAnnotation } from './types';
import { getSingleAnnotationGeometry } from './annotationGeometryUtils';
import { BoxUtils } from '../../../base/utilities/box/BoxUtils';

export class PendingAnnotation {
  matrix: Matrix4;
  public annotation: PointCloudAnnotation | undefined;

  public constructor(matrix: Matrix4, annotation: PointCloudAnnotation | undefined = undefined) {
    this.matrix = matrix;
    this.annotation = annotation;
  }

  public getBoundingBox(): Box3 {
    return BoxUtils.getBoundingBox(this.matrix);
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
