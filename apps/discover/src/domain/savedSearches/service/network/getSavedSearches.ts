import {
  SAVED_SEARCHES_CURRENT_KEY,
  SAVED_SEARCH_ENDPOINT,
} from 'domain/savedSearches/constants';
import { SavedSearchItem } from 'domain/savedSearches/types';

import reduce from 'lodash/reduce';
import { fetchGet, FetchHeaders } from 'utils/fetch';

import { SIDECAR } from 'constants/app';
import { RELATED_DOCUMENT_KEY } from 'constants/react-query';

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
      if (
        value.id === SAVED_SEARCHES_CURRENT_KEY ||
        value.id === RELATED_DOCUMENT_KEY ||
        // we need this since we have saved a lot of entries with this key already
        // so we need to make an exclusion and restrict this name too, to not show all the wrongly created saved searches
        // the api fix is in place to convert this to an id, so it will not happen from this point on
        value.name === RELATED_DOCUMENT_KEY
      ) {
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
