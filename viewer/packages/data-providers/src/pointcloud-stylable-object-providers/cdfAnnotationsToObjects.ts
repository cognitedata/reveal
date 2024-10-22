/*!
 * Copyright 2022 Cognite AS
 */

import { CompositeShape } from '@reveal/utilities';

import { PointCloudObject, CdfPointCloudObjectAnnotation, PointCloudDataType } from './types';
import { StylableObject } from './StylableObject';

function cdfAnnotationsToPointCloudObjects<T extends PointCloudDataType>(
  cdfAnnotations: CdfPointCloudObjectAnnotation[]
): PointCloudObject<T>[] {
  const resultAnnotations = cdfAnnotations.map((cdfAnnotation, index) => {
    const shapes = cdfAnnotation.region;

    const compShape = new CompositeShape(shapes);
    const stylableObject: StylableObject = {
      shape: compShape,
      objectId: index + 1
    };
    const annotationId = cdfAnnotation.annotationId;
    const volumeMetadata =
      annotationId === 0
        ? { volumeInstanceRef: cdfAnnotation.volumeInstanceRef, assetRef: cdfAnnotation.asset }
        : { annotationId, assetRef: cdfAnnotation.asset };

    const pointCloudObject = {
      boundingBox: stylableObject.shape.createBoundingBox(),
      ...(volumeMetadata as T['volumeMetadata']),
      stylableObject
    };

    return pointCloudObject;
  });

  return resultAnnotations;
}

export function cdfAnnotationsToObjectInfo<T extends PointCloudDataType>(
  annotations: CdfPointCloudObjectAnnotation[]
): PointCloudObject<T>[] {
  return cdfAnnotationsToPointCloudObjects(annotations);
}
