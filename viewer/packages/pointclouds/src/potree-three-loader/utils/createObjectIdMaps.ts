/*!
 * Copyright 2022 Cognite AS
 */

import {
  isPointCloudObjectDataModelProperties,
  isPointCloudObjectMetadata,
  PointCloudObject
} from '@reveal/data-providers';
import { PointCloudObjectIdMaps } from '@reveal/rendering';

export function createObjectIdMaps(objects: PointCloudObject[]): PointCloudObjectIdMaps {
  const annotationToObjectIds = new Map<number | string, number>();
  const objectToAnnotationIds = new Map<number, number | string>();

  objects.forEach(annotation => {
    const objectId = annotation.stylableObject.objectId;
    if (isPointCloudObjectMetadata(annotation)) {
      annotationToObjectIds.set(annotation.annotationId, objectId);
      objectToAnnotationIds.set(objectId, annotation.annotationId);
    } else if (isPointCloudObjectDataModelProperties(annotation)) {
      annotationToObjectIds.set(annotation.instanceRef.externalId, objectId);
      objectToAnnotationIds.set(objectId, annotation.instanceRef.externalId);
    } else {
      throw new Error('Unknown PointCloudObject type');
    }
  });

  return {
    annotationToObjectIds,
    objectToAnnotationIds
  };
}
