import { SavedSearchItem } from 'domain/savedSearches/types';

import { SavedSearchAddShareSchemaBody } from '@cognite/discover-api-types';

import {
  getMockDocumentFilter,
  getMockWellFilter,
} from '../../../../__test-utils/fixtures/sidebar';
import { SavedSearchSaveResponse } from '../types';

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

export const responseData: SavedSearchSaveResponse = {
  data: {
    savedSearch: { name: 'test-name', id: 'test-id', filters: {} },
  },
};

export const requestBody: SavedSearchAddShareSchemaBody = {
  id: 'test-id',
  users: ['user1', 'user2'],
};

export const TEST_ID = 'test-id';
