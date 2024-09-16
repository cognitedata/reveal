/*!
 * Copyright 2024 Cognite AS
 */

import {
  type AnnotationsCogniteAnnotationTypesImagesAssetLink,
  type AnnotationModel,
  type AnnotationsBoundingVolume,
  type AssetMapping3D
} from '@cognite/sdk';

export function getAssetIdOrExternalIdFromPointCloudAnnotation(
  annotation: AnnotationModel
): string | number | undefined {
  const annotationData = annotation.data as AnnotationsBoundingVolume;
  return annotationData.assetRef?.id ?? annotationData.assetRef?.externalId;
}

export function getAssetIdOrExternalIdFromImage360Annotation(
  annotation: AnnotationModel
): string | number | undefined {
  const annotationData = annotation.data as AnnotationsCogniteAnnotationTypesImagesAssetLink;
  return annotationData.assetRef?.id ?? annotationData.assetRef?.externalId;
}

export function isValidAssetMapping(assetMapping: AssetMapping3D): assetMapping is AssetMapping3D {
  return assetMapping.treeIndex !== undefined && assetMapping.subtreeSize !== undefined;
}
