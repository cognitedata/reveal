import { SAVED_SEARCH_ENDPOINT } from 'domain/savedSearches/constants';

import { FetchHeaders, fetchPost } from 'utils/fetch';

import { SavedSearchRemoveShareSchemaPOST } from '@cognite/discover-api-types';

import { SIDECAR } from 'constants/app';

export const removeShareSavedSearch = async <T>(
  body: SavedSearchRemoveShareSchemaPOST,
  headers: FetchHeaders,
  tenant: string
) => {
  return fetchPost<T>(
    `${SIDECAR.discoverApiBaseUrl}/${tenant}/${SAVED_SEARCH_ENDPOINT}/removeshare`,
    body,
    { headers }
  );
};
