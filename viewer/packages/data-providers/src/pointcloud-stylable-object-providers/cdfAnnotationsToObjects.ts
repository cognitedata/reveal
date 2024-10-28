/*!
 * Copyright 2022 Cognite AS
 */

import { CompositeShape } from '@reveal/utilities';

import { PointCloudObject, CdfPointCloudObjectAnnotation, isVolumeDMReference } from './types';
import { StylableObject } from './StylableObject';
import { DataSourceType } from '../DataSourceType';

function cdfAnnotationsToPointCloudObjects<T extends DataSourceType>(
  cdfAnnotations: CdfPointCloudObjectAnnotation[]
): PointCloudObject<T>[] {
  const resultAnnotations = cdfAnnotations.map((cdfAnnotation, index) => {
    const shapes = cdfAnnotation.region;

    const compShape = new CompositeShape(shapes);
    const stylableObject: StylableObject = {
      shape: compShape,
      objectId: index + 1
    };

    const volumeMetadata = isVolumeDMReference(cdfAnnotation.volumeMetadata)
      ? { volumeInstanceRef: cdfAnnotation.volumeMetadata.instanceRef, assetRef: cdfAnnotation.volumeMetadata.asset }
      : { annotationId: cdfAnnotation.volumeMetadata.annotationId, assetRef: cdfAnnotation.volumeMetadata.asset };

    const pointCloudObject = {
      boundingBox: stylableObject.shape.createBoundingBox(),
      ...(volumeMetadata as T['pointCloudVolumeMetadata']),
      stylableObject
    };

    return pointCloudObject;
  });

  return resultAnnotations;
}

export function cdfAnnotationsToObjectInfo<T extends DataSourceType>(
  annotations: CdfPointCloudObjectAnnotation[]
): PointCloudObject<T>[] {
  return cdfAnnotationsToPointCloudObjects(annotations);
}
