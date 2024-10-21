/*!
 * Copyright 2024 Cognite AS
 */

import { PointCloudDMVolumeCollection } from './PointCloudDMVolumeCollection';
import { PointCloudAnnotationVolumeCollection } from './PointCloudObjectCollection';

export function isPointCloudObjectCollection(
  collection: PointCloudAnnotationVolumeCollection | PointCloudDMVolumeCollection
): collection is PointCloudAnnotationVolumeCollection {
  return (collection as PointCloudAnnotationVolumeCollection).getAnnotationIds !== undefined;
}

export function isDMInstanceRefPointCloudObjectCollection(
  collection: PointCloudAnnotationVolumeCollection | PointCloudDMVolumeCollection
): collection is PointCloudDMVolumeCollection {
  return (collection as PointCloudDMVolumeCollection).getDataModelInstanceRefs !== undefined;
}
