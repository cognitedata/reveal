/*!
 * Copyright 2022 Cognite AS
 */

import { CompositeShape } from '@reveal/utilities';

import { PointCloudObject, CdfPointCloudObjectAnnotation, isVolumeDMReference } from './types';
import { StylableObject } from './StylableObject';
import { DataSourceType } from '../DataSourceType';

export function cdfAnnotationsToObjects<T extends DataSourceType>(
  cdfAnnotations: CdfPointCloudObjectAnnotation[]
): PointCloudObject<T>[] {
  return cdfAnnotations.map((cdfAnnotation, index) => {
    const shapes = cdfAnnotation.region;

    const compShape = new CompositeShape(shapes);
    const stylableObject: StylableObject = {
      shape: compShape,
      objectId: index + 1
    };

    const volumeMetadata: T['pointCloudVolumeMetadata'] = isVolumeDMReference(cdfAnnotation.volumeMetadata)
      ? { volumeInstanceRef: cdfAnnotation.volumeMetadata.instanceRef, assetRef: cdfAnnotation.volumeMetadata.asset }
      : {
          annotationId: cdfAnnotation.volumeMetadata.annotationId,
          assetRef: cdfAnnotation.volumeMetadata.asset,
          instanceRef: cdfAnnotation.volumeMetadata.assetInstanceRef
        };

    return {
      boundingBox: stylableObject.shape.createBoundingBox(),
      stylableObject,
      ...volumeMetadata
    };
  });
}
