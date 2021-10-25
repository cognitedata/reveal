import { SavedSearchItem } from 'modules/api/savedSearches/types';

import { getMockDocumentFilter, getMockWellFilter } from './sidebar';

export const DEFAULT_MOCKED_SAVED_SEARCH_NAME = 'default-saved-search';

export type FilterType = 'documents' | 'wells';

export const getMockedEmptySavedSearch = (name?: string): SavedSearchItem => ({
  value: {
    filters: {},
  },
  name: name || DEFAULT_MOCKED_SAVED_SEARCH_NAME,
  id: 'test-id',
});

export const getMockedSavedSearchWithFilters = (
  filterTypes: FilterType[],
  extras?: Partial<SavedSearchItem>
): SavedSearchItem => ({
  ...getMockedEmptySavedSearch(),
  value: {
    filters: {
      ...(filterTypes.includes('documents') && {
        documents: { facets: getMockDocumentFilter() },
      }),
      ...(filterTypes.includes('wells') && { wells: getMockWellFilter() }),
    },
  },
  ...extras,
});
