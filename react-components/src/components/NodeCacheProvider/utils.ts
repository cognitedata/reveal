/*!
 * Copyright 2024 Cognite AS
 */

import { type CogniteInternalId } from '@cognite/sdk/dist/src';
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
