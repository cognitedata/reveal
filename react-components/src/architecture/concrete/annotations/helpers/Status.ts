/*!
 * Copyright 2024 Cognite AS
 */

import { type AnnotationStatus } from '@cognite/sdk';
import { type PointCloudAnnotation } from '../utils/types';
import { isAnnotationsBoundingVolume } from '../utils/annotationGeometryUtils';

export enum Status {
  Contextualized, // This state is Approved and has AssetRef != undefined
  Approved,
  Suggested,
  Rejected
}

export const ALL_STATUSES = [
  Status.Rejected,
  Status.Suggested,
  Status.Approved,
  Status.Contextualized
];

export function getStatusByAnnotation(annotation: PointCloudAnnotation): Status {
  const volume = annotation.geometry;
  if (!isAnnotationsBoundingVolume(volume)) {
    return Status.Rejected;
  }
  if (volume === undefined || volume.region.length === 0) {
    return Status.Rejected;
  }
  const assetId = volume.assetRef?.id;
  return getStatus(annotation.status, assetId);
}

function getStatus(status: AnnotationStatus, assetId: number | undefined): Status {
  if (assetId !== undefined) {
    return Status.Contextualized;
  }
  if (status === 'approved') {
    return Status.Approved;
  }
  if (status === 'suggested') {
    return Status.Suggested;
  }
  return Status.Rejected;
}
