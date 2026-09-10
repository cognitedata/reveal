/*!
 * Copyright 2022 Cognite AS
 */

import type { PointCloudObject, DataSourceType } from '@reveal/data-providers';
import { isClassicPointCloudVolumeObject, isDMPointCloudVolumeObject } from '@reveal/data-providers';
import type { PointCloudObjectIdMaps } from '@reveal/rendering';
import type { DMInstanceKey, DMInstanceRef } from '@reveal/utilities';
import { dmInstanceRefToKey } from '@reveal/utilities';

export function createObjectIdMaps<T extends DataSourceType>(objects: PointCloudObject<T>[]): PointCloudObjectIdMaps {
  const annotationToObjectIds = new Map<number | DMInstanceKey, number>();
  const objectToAnnotationIds = new Map<number, number | DMInstanceRef>();

  objects.forEach(annotation => {
    const objectId = annotation.stylableObject.objectId;
    if (isClassicPointCloudVolumeObject(annotation)) {
      annotationToObjectIds.set(annotation.annotationId, objectId);
      objectToAnnotationIds.set(objectId, annotation.annotationId);
    } else if (isDMPointCloudVolumeObject(annotation)) {
      annotationToObjectIds.set(dmInstanceRefToKey(annotation.volumeInstanceRef), objectId);
      objectToAnnotationIds.set(objectId, annotation.volumeInstanceRef);
    }
  });

  return {
    annotationToObjectIds,
    objectToAnnotationIds
  };
}
