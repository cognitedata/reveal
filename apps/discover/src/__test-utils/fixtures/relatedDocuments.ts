import { SavedSearchContent } from 'domain/savedSearches/types';

import { getMockDocumentEmptyFacets } from './document';

export const getMockRelatedDocumentsFilters = (
  extras?: Partial<SavedSearchContent>
): SavedSearchContent => ({
  filters: {
    documents: {
      facets: getMockDocumentEmptyFacets({
        fileCategory: ['Test File Type 1'],
      }),
    },
  },
  ...extras,
});
