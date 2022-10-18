/*!
 * Copyright 2022 Cognite AS
 */

import { CompositeShape } from '@reveal/utilities';

import { applyDefaultModelTransformation } from '../utilities/applyDefaultModelTransformation';
import { PointCloudObject, CdfPointCloudObjectAnnotation } from './types';
import { StylableObject } from './StylableObject';

import { Matrix4 } from 'three';
import { File3dFormat } from '../types';

function cdfAnnotationsToPointCloudObjects(cdfAnnotations: CdfPointCloudObjectAnnotation[]): PointCloudObject[] {
  const resultAnnotations = cdfAnnotations.map((cdfAnnotation, index) => {
    const shapes = cdfAnnotation.region;

    const compShape = new CompositeShape(shapes);
    const stylableObject: StylableObject = {
      shape: compShape,
      objectId: index + 1
    };

    const cadFromCdfToThreeMatrix = new Matrix4();
    applyDefaultModelTransformation(cadFromCdfToThreeMatrix, File3dFormat.EptPointCloud);

    return {
      annotationId: cdfAnnotation.annotationId,
      assetId: cdfAnnotation.assetId,
      boundingBox: stylableObject.shape.createBoundingBox(),
      stylableObject
    };
  });

  return resultAnnotations;
}

export function cdfAnnotationsToObjectInfo(annotations: CdfPointCloudObjectAnnotation[]): PointCloudObject[] {
  return cdfAnnotationsToPointCloudObjects(annotations);
}
