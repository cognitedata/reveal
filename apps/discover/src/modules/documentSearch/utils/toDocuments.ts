import { DocumentSearchResponse } from '@cognite/sdk';

import { DocumentType } from '../types';

import { detectDuplicates } from './detectDuplicates';
import { toDocument } from './toDocument';

export const toDocuments = (result: DocumentSearchResponse): DocumentType[] => {
  const originalList = result.items.map(toDocument);
  return detectDuplicates(originalList);
};
