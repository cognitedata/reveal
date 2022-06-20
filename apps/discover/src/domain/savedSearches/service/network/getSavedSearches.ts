import {
  SAVED_SEARCHES_CURRENT_KEY,
  SAVED_SEARCH_ENDPOINT,
} from 'domain/savedSearches/constants';
import { SavedSearchItem } from 'domain/savedSearches/types';

import reduce from 'lodash/reduce';
import { fetchGet, FetchHeaders } from 'utils/fetch';

import { SIDECAR } from 'constants/app';

import { SavedSearchListResponse } from '../types';

export const getSavedSearches = async (
  headers: FetchHeaders,
  tenant: string
): Promise<SavedSearchItem[]> => {
  const response = await fetchGet<SavedSearchListResponse>(
    `${SIDECAR.discoverApiBaseUrl}/${tenant}/${SAVED_SEARCH_ENDPOINT}`,
    { headers }
  );

  return reduce(
    response.data.list,
    (result, value) => {
      // never show current, as that is our internal state
      if (value.id === SAVED_SEARCHES_CURRENT_KEY) {
        return result;
      }

      const { name = '?', owner, ...values } = value;
      // the server should return a parsed format
      // this is only temp till we make those changes
      return [
        ...result,
        {
          name,
          id: value.id,
          value: values,
          owner,
        },
      ];
    },
    [] as SavedSearchItem[]
  );
};
