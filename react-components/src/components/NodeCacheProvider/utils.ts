/*!
 * Copyright 2024 Cognite AS
 */

import {
  type AnnotationModel,
  type AnnotationsBoundingVolume,
  type CogniteInternalId
} from '@cognite/sdk';
import {
  type ModelRevisionId,
  type ModelAssetIdKey,
  type ModelId,
  type ModelRevisionKey,
  type RevisionId
} from './types';

export function modelRevisionToKey(modelId: ModelId, revisionId: RevisionId): ModelRevisionKey {
  return `${modelId}/${revisionId}`;
}

export function modelRevisionAssetIdsToKey(
  modelRevisionId: ModelRevisionId,
  assetId: CogniteInternalId
): ModelAssetIdKey {
  return `${modelRevisionId.modelId}/${modelRevisionId.revisionId}/${assetId}`;
}

export function getAssetIdOrExternalIdFromAnnotation(
  annotation: AnnotationModel
): string | number | undefined {
  return (
    (annotation.data as AnnotationsBoundingVolume).assetRef?.id ??
    (annotation.data as AnnotationsBoundingVolume).assetRef?.externalId
  );
}
