import { GenericApiError } from 'domain/documents/service/types';
import { SAVED_SEARCH_ENDPOINT } from 'domain/savedSearches/constants';
import { SavedSearchContent } from 'domain/savedSearches/types';

import { FetchHeaders, fetchPut } from 'utils/fetch';

import { SavedSearchSchemaBody } from '@cognite/discover-api-types';

import { SIDECAR } from 'constants/app';

import { SavedSearchSaveResponse } from '../types';

export const createSavedSearch = async (
  id: string,
  body: SavedSearchSchemaBody,
  headers: FetchHeaders,
  tenant: string
): Promise<SavedSearchContent | GenericApiError> => {
  const response = await fetchPut<SavedSearchSaveResponse>(
    `${SIDECAR.discoverApiBaseUrl}/${tenant}/${SAVED_SEARCH_ENDPOINT}/${id}`,
    body,
    { headers }
  );

  if (response.success) {
    return response.data.savedSearch;
  }

  return Promise.reject(response);
};
