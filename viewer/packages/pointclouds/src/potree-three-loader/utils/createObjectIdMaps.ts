/*!
 * Copyright 2022 Cognite AS
 */

import {
  DMInstanceRef,
  isClassicPointCloudDataTypeObject,
  isDMPointCloudDataTypeObject,
  PointCloudObject,
  DataSourceType
} from '@reveal/data-providers';
import { PointCloudObjectIdMaps } from '@reveal/rendering';

export function createObjectIdMaps<T extends DataSourceType>(objects: PointCloudObject<T>[]): PointCloudObjectIdMaps {
  const annotationToObjectIds = new Map<number | DMInstanceRef, number>();
  const objectToAnnotationIds = new Map<number, number | DMInstanceRef>();

  objects.forEach(annotation => {
    const objectId = annotation.stylableObject.objectId;
    if (isClassicPointCloudDataTypeObject(annotation)) {
      annotationToObjectIds.set(annotation.annotationId, objectId);
      objectToAnnotationIds.set(objectId, annotation.annotationId);
    } else if (isDMPointCloudDataTypeObject(annotation)) {
      annotationToObjectIds.set(annotation.volumeInstanceRef, objectId);
      objectToAnnotationIds.set(objectId, annotation.volumeInstanceRef);
    }
  });

  return {
    annotationToObjectIds,
    objectToAnnotationIds
  };
}
