import { SAVED_SEARCH_ENDPOINT } from 'domain/savedSearches/constants';

import { fetchGet, FetchHeaders } from 'utils/fetch';

import { SIDECAR } from 'constants/app';
import { GenericApiError } from 'core/types';

import { SavedSearchGetResponse } from '../types';

export const getSavedSearch = async (
  id: string,
  headers: FetchHeaders,
  tenant: string
) => {
  const response = await fetchGet<SavedSearchGetResponse>(
    `${SIDECAR.discoverApiBaseUrl}/${tenant}/${SAVED_SEARCH_ENDPOINT}/${id}`,
    { headers }
  );

  if (response.success) {
    if (response.data && response.data.error) {
      return { error: true } as GenericApiError;
    }

    return response.data.data;
  }

  return {
    error: true,
  } as GenericApiError;
};
