/*!
 * Copyright 2024 Cognite AS
 */

import {
  type AnnotationsCogniteAnnotationTypesImagesAssetLink,
  type AnnotationModel,
  type AnnotationsBoundingVolume,
  type CogniteInternalId,
  type AssetMapping3D
} from '@cognite/sdk';
import {
  type ModelRevisionId,
  type ModelAssetIdKey,
  type ModelId,
  type RevisionId,
  type ModelTreeIndexKey
} from './types';

export function modelRevisionNodesAssetsToKey(
  modelId: ModelId,
  revisionId: RevisionId,
  ids: number[]
): ModelTreeIndexKey {
  const idsSerialized = ids.reduce((a, b) => a + b, 0);
  return `${modelId}/${revisionId}/${idsSerialized}`;
}

export function modelRevisionAssetIdsToKey(
  modelRevisionId: ModelRevisionId,
  assetId: CogniteInternalId
): ModelAssetIdKey {
  return `${modelRevisionId.modelId}/${modelRevisionId.revisionId}/${assetId}`;
}

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
