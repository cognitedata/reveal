/*!
 * Copyright 2024 Cognite AS
 */

import {
  type PointCloudVolumeDMStylingGroup,
  type AnnotationIdStylingGroup,
  type PointCloudVolumeStylingGroup
} from './types';

export function isAnnotationIdStylingGroup(
  pointCloudStylingGroup: PointCloudVolumeStylingGroup
): pointCloudStylingGroup is AnnotationIdStylingGroup {
  const annotationIdStylingGroup = pointCloudStylingGroup as AnnotationIdStylingGroup;
  return (
    Array.isArray(annotationIdStylingGroup.annotationIds) &&
    annotationIdStylingGroup.annotationIds.every((id) => typeof id === 'number') &&
    'style' in annotationIdStylingGroup
  );
}

export function isPointCloudVolumeDMStylingGroup(
  pointCloudStylingGroup: PointCloudVolumeStylingGroup
): pointCloudStylingGroup is PointCloudVolumeDMStylingGroup {
  return 'instanceRef' in pointCloudStylingGroup && 'style' in pointCloudStylingGroup;
}

export function isPointCloudVolumeStylingGroup(
  PointCloudVolumeStylingGroup: PointCloudVolumeStylingGroup
): PointCloudVolumeStylingGroup is PointCloudVolumeStylingGroup {
  return (
    isAnnotationIdStylingGroup(PointCloudVolumeStylingGroup) ||
    isPointCloudVolumeDMStylingGroup(PointCloudVolumeStylingGroup)
  );
}
