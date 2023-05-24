import { InternalDocument as InternalDocumentCore } from '@data-exploration-lib/core';
import { MatchingLabels } from '../../types';
// This is needed to not create circular dependencies

// Flattened version of 'DocumentSearchItem' from cognite/sdk
export type InternalDocument = InternalDocumentCore;

export interface InternalDocumentWithMatchingLabels extends InternalDocument {
  matchingLabels?: MatchingLabels; // INFO: This is only optional for now, to not crash the legacy types -_-
}
