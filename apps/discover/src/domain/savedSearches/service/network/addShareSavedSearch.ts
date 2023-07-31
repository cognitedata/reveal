import { SAVED_SEARCH_ENDPOINT } from 'domain/savedSearches/constants';
import { SavedSearchContent } from 'domain/savedSearches/types';

import { FetchHeaders, fetchPost } from 'utils/fetch';

import { SavedSearchAddShareSchemaBody } from '@cognite/discover-api-types';

import { SIDECAR } from 'constants/app';
import { GenericApiError } from 'core/types';

import { SavedSearchSaveResponse } from '../types';

export const addShareSavedSearch = async (
  body: SavedSearchAddShareSchemaBody,
  headers: FetchHeaders,
  tenant: string
): Promise<SavedSearchContent | GenericApiError> => {
  const response = await fetchPost<SavedSearchSaveResponse>(
    `${SIDECAR.discoverApiBaseUrl}/${tenant}/${SAVED_SEARCH_ENDPOINT}/share`,
    body,
    { headers }
  );

  if (response.success) {
    return response.data.savedSearch;
  }

  return { error: true } as GenericApiError;
};
