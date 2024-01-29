/*!
 * Copyright 2024 Cognite AS
 */

import { type ModelId, type ModelRevisionKey, type RevisionId } from './types';

export function modelRevisionToKey(modelId: ModelId, revisionId: RevisionId): ModelRevisionKey {
  return `${modelId}/${revisionId}`;
}
