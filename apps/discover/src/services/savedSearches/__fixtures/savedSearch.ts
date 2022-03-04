import { SavedSearchItem } from 'services/savedSearches/types';

import {
  getMockDocumentFilter,
  getMockWellFilter,
} from '../../../__test-utils/fixtures/sidebar';

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
