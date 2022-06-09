import { SAVED_SEARCH_ENDPOINT } from 'domain/savedSearches/constants';

import { fetchDelete, FetchHeaders } from 'utils/fetch';

import { SIDECAR } from 'constants/app';

export const deleteSavedSearch = (
  id: string,
  headers: FetchHeaders,
  tenant: string
) => {
  return fetchDelete(
    `${SIDECAR.discoverApiBaseUrl}/${tenant}/${SAVED_SEARCH_ENDPOINT}/${id}`,
    { headers }
  );
};
