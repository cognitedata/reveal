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
      assetId: cdfAnnotation.asset && 'id' in cdfAnnotation.asset ? cdfAnnotation.asset.id : undefined,
      assetRef: cdfAnnotation.asset,
      boundingBox: stylableObject.shape.createBoundingBox(),
      volumeRef: cdfAnnotation.volumeInstanceRef,
      stylableObject
    };
  });

  return resultAnnotations;
}

export function cdfAnnotationsToObjectInfo(annotations: CdfPointCloudObjectAnnotation[]): PointCloudObject[] {
  return cdfAnnotationsToPointCloudObjects(annotations);
}
