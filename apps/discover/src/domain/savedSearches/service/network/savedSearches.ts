import {
  SavedSearchAddShareSchemaBody,
  SavedSearchRemoveShareSchemaPOST,
  SavedSearchSchemaBody,
} from '@cognite/discover-api-types';

import { GenericApiError } from '../../../../services/types';
import { FetchHeaders } from '../../../../utils/fetch';
import { SavedSearchContent, SavedSearchItem } from '../../types';

import { addShareSavedSearch } from './addShareSavedSearch';
import { createSavedSearch } from './createSavedSearch';
import { deleteSavedSearch } from './deleteSavedSearch';
import { getSavedSearch } from './getSavedSearch';
import { getSavedSearches } from './getSavedSearches';
import { removeShareSavedSearch } from './removeShareSavedSearch';

export const savedSearches = {
  get: (id: string, headers: FetchHeaders, tenant: string) =>
    getSavedSearch(id, headers, tenant),

  list: async (
    headers: FetchHeaders,
    tenant: string
  ): Promise<SavedSearchItem[]> => getSavedSearches(headers, tenant),

  delete: (id: string, headers: FetchHeaders, tenant: string) =>
    deleteSavedSearch(id, headers, tenant),

  create: async (
    id: string,
    body: SavedSearchSchemaBody,
    headers: FetchHeaders,
    tenant: string
  ): Promise<SavedSearchContent | GenericApiError> =>
    createSavedSearch(id, body, headers, tenant),

  addShare: async (
    body: SavedSearchAddShareSchemaBody,
    headers: FetchHeaders,
    tenant: string
  ): Promise<SavedSearchContent | GenericApiError> =>
    addShareSavedSearch(body, headers, tenant),

  removeShare: async (
    body: SavedSearchRemoveShareSchemaPOST,
    headers: FetchHeaders,
    tenant: string
  ) => removeShareSavedSearch(body, headers, tenant),
};
