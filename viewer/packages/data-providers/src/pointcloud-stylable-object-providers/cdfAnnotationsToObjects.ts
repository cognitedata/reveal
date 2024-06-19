/*!
 * Copyright 2022 Cognite AS
 */

import { CompositeShape } from '@reveal/utilities';

import { PointCloudObject, CdfPointCloudObjectAnnotation } from './types';
import { StylableObject } from './StylableObject';

function cdfAnnotationsToPointCloudObjects(cdfAnnotations: CdfPointCloudObjectAnnotation[]): PointCloudObject[] {
  const resultAnnotations = cdfAnnotations.map((cdfAnnotation, index) => {
    const shapes = cdfAnnotation.region;

    const compShape = new CompositeShape(shapes);
    const stylableObject: StylableObject = {
      shape: compShape,
      objectId: index + 1
    };

    return {
      annotationId: cdfAnnotation.annotationId,
      assetId: cdfAnnotation.asset?.id,
      assetRef: cdfAnnotation.asset,
      boundingBox: stylableObject.shape.createBoundingBox(),
      stylableObject
    };
  });

  return resultAnnotations;
}

export function cdfAnnotationsToObjectInfo(annotations: CdfPointCloudObjectAnnotation[]): PointCloudObject[] {
  return cdfAnnotationsToPointCloudObjects(annotations);
}
