import reduce from 'lodash/reduce';

import {
  SavedSearchAddShareSchemaBody,
  SavedSearchRemoveShareSchemaPOST,
  SavedSearchSchemaBody,
} from '@cognite/discover-api-types';

import { SIDECAR } from '../../constants/app';
import { RELATED_DOCUMENT_KEY } from '../../constants/react-query';
import {
  fetchDelete,
  fetchGet,
  FetchHeaders,
  fetchPut,
  fetchPost,
} from '../../utils/fetch';
import { BaseAPIResult, GenericApiError } from '../types';

import { SAVED_SEARCHES_CURRENT_KEY } from './constants';
import { SavedSearchContent, SavedSearchItem } from './types';

export interface SavedSearchListResponse extends BaseAPIResult {
  data: {
    list: Record<string, SavedSearchContent>;
  };
}
export interface SavedSearchGetResponse extends BaseAPIResult {
  data: {
    error: boolean;
    data: SavedSearchContent;
  };
}
export interface SavedSearchSaveResponse extends BaseAPIResult {
  data: {
    savedSearch: SavedSearchContent;
  };
}

const SAVED_SEARCH_ENDPOINT = 'savedSearches';
export const savedSearches = {
  get: async (id: string, headers: FetchHeaders, tenant: string) => {
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
  },

  list: async (
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
  },

  delete: (id: string, headers: FetchHeaders, tenant: string) => {
    return fetchDelete(
      `${SIDECAR.discoverApiBaseUrl}/${tenant}/${SAVED_SEARCH_ENDPOINT}/${id}`,
      { headers }
    );
  },

  create: async (
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
  },

  addShare: async (
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
  },

  removeShare: async <T>(
    body: SavedSearchRemoveShareSchemaPOST,
    headers: FetchHeaders,
    tenant: string
  ) => {
    return fetchPost<T>(
      `${SIDECAR.discoverApiBaseUrl}/${tenant}/${SAVED_SEARCH_ENDPOINT}/removeshare`,
      body,
      { headers }
    );
  },
};
