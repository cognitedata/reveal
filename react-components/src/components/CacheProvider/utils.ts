/*!
 * Copyright 2024 Cognite AS
 */

import {
  type AnnotationsCogniteAnnotationTypesImagesAssetLink,
  type AnnotationModel,
  type AnnotationsBoundingVolume,
  type CogniteInternalId
} from '@cognite/sdk';
import {
  type ModelRevisionId,
  type ModelAssetIdKey,
  type ModelId,
  type ModelRevisionKey,
  type RevisionId,
  type ModelNodeIdKey
} from './types';

export function modelRevisionToKey(modelId: ModelId, revisionId: RevisionId): ModelRevisionKey {
  return `${modelId}/${revisionId}`;
}

export function modelRevisionNodesToKey(
  modelId: ModelId,
  revisionId: RevisionId,
  nodeIds: number[]
): ModelNodeIdKey {
  const nodeIdsSerialized = nodeIds.reduce((a, b) => a + b, 0);
  return `${modelId}/${revisionId}/${nodeIdsSerialized}`;
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
  return (
    (annotation.data as AnnotationsBoundingVolume).assetRef?.id ??
    (annotation.data as AnnotationsBoundingVolume).assetRef?.externalId
  );
}

export function getAssetIdOrExternalIdFromImage360Annotation(
  annotation: AnnotationModel
): string | number | undefined {
  return (
    (annotation.data as AnnotationsCogniteAnnotationTypesImagesAssetLink).assetRef?.id ??
    (annotation.data as AnnotationsCogniteAnnotationTypesImagesAssetLink).assetRef?.externalId
  );
}
