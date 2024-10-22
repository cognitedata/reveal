/*!
 * Copyright 2022 Cognite AS
 */

import { DMInstanceRef, isPointCloudObjectMetadata, PointCloudObject } from '@reveal/data-providers';
import { PointCloudObjectIdMaps } from '@reveal/rendering';

export function createObjectIdMaps(objects: PointCloudObject[]): PointCloudObjectIdMaps {
  const annotationToObjectIds = new Map<number | DMInstanceRef, number>();
  const objectToAnnotationIds = new Map<number, number | DMInstanceRef>();

  objects.forEach(annotation => {
    const objectId = annotation.stylableObject.objectId;
    if (isPointCloudObjectMetadata(annotation)) {
      annotationToObjectIds.set(annotation.annotationId, objectId);
      objectToAnnotationIds.set(objectId, annotation.annotationId);
    } else {
      annotationToObjectIds.set(annotation.volumeRef, objectId);
      objectToAnnotationIds.set(objectId, annotation.volumeRef);
    }
  });

  return {
    annotationToObjectIds,
    objectToAnnotationIds
  };
}
