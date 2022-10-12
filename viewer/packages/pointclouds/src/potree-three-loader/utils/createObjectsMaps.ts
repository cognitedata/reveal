/*!
 * Copyright 2022 Cognite AS
 */

import { PointCloudObject } from '@reveal/data-providers';
import { PointCloudObjectIdMaps } from '@reveal/rendering';

export function createObjectsMaps(objects: PointCloudObject[]): PointCloudObjectIdMaps {
  const objectsMaps = {
    annotationToObjectIds: new Map<number, number>(
      objects.map(annotation => [annotation.annotationId, annotation.stylableObject.objectId])
    ),
    objectToAnnotationIds: new Map<number, number>(
      objects.map(annotation => [annotation.stylableObject.objectId, annotation.annotationId])
    )
  };

  return objectsMaps;
}
