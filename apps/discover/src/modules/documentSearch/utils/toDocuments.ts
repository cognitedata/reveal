import { DocumentsAggregatesResponse, DocumentType } from '../types';

import { detectDuplicates } from './detectDuplicates';
import { toDocument } from './toDocument';

export const toDocuments = (
  result: DocumentsAggregatesResponse
): DocumentType[] => {
  const originalList = result.items.map(toDocument);
  return detectDuplicates(originalList);
};
