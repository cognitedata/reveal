/*!
 * Copyright 2024 Cognite AS
 */

import { DMInstanceRefPointCloudObjectCollection } from './DMInstanceRefPointCloudObjectCollection';
import { PointCloudObjectCollection } from './PointCloudObjectCollection';

export function isPointCloudObjectCollection(
  collection: PointCloudObjectCollection | DMInstanceRefPointCloudObjectCollection
): collection is PointCloudObjectCollection {
  return (collection as PointCloudObjectCollection).getAnnotationIds !== undefined;
}

export function isDMInstanceRefPointCloudObjectCollection(
  collection: PointCloudObjectCollection | DMInstanceRefPointCloudObjectCollection
): collection is DMInstanceRefPointCloudObjectCollection {
  return (collection as DMInstanceRefPointCloudObjectCollection).getDataModelInstanceRefs !== undefined;
}
