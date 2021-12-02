import reduce from 'lodash/reduce';

import {
  fetchDelete,
  fetchGet,
  FetchHeaders,
  fetchPut,
  fetchPost,
} from '../../../_helpers/fetch';
import { SIDECAR } from '../../../constants/app';
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
  },

  delete: (id: string, headers: FetchHeaders, tenant: string) => {
    return fetchDelete(
      `${SIDECAR.discoverApiBaseUrl}/${tenant}/${SAVED_SEARCH_ENDPOINT}/${id}`,
      { headers }
    );
  },

  save: async (
    searchOptions: SavedSearchContent,
    name: string,
    headers: FetchHeaders,
    tenant: string
  ): Promise<SavedSearchContent | GenericApiError> => {
    const response = await fetchPut<SavedSearchSaveResponse>(
      `${SIDECAR.discoverApiBaseUrl}/${tenant}/${SAVED_SEARCH_ENDPOINT}/${name}`,
      searchOptions,
      { headers }
    );

    if (response.success) {
      return response.data.savedSearch;
    }

    return Promise.reject(response);
  },

  addShare: async (
    payload: {
      id: string;
      users: string[];
    },
    headers: FetchHeaders,
    tenant: string
  ): Promise<SavedSearchContent | GenericApiError> => {
    const response = await fetchPost<SavedSearchSaveResponse>(
      `${SIDECAR.discoverApiBaseUrl}/${tenant}/${SAVED_SEARCH_ENDPOINT}/share`,
      payload,
      { headers }
    );

    if (response.success) {
      return response.data.savedSearch;
    }

    return { error: true } as GenericApiError;
  },

  removeShare: async <T>(
    id: string,
    user: string,
    headers: FetchHeaders,
    tenant: string
  ) =>
    fetchPost<T>(
      `${SIDECAR.discoverApiBaseUrl}/${tenant}/${SAVED_SEARCH_ENDPOINT}/removeshare`,
      {
        id,
        user,
      },
      { headers }
    ),
};
