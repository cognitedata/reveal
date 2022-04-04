import { useMutation, useQueryClient } from 'react-query';

import { useJsonHeaders } from 'services/service';
import { handleServiceError } from 'utils/errors';
import { log } from 'utils/log';

import {
  SavedSearchAddShareSchemaBody,
  SavedSearchRemoveShareSchemaPOST,
  SavedSearchSchemaBody,
} from '@cognite/discover-api-types';
import { getTenantInfo } from '@cognite/react-container';

import { SAVED_SEARCHES_QUERY_KEY } from 'constants/react-query';

import { discoverAPI } from '../service';

export const useSavedSearchMutate = () => {
  log('this is where we should move the saved search mutate into');
};

export function useSavedSearchAddShareMutate() {
  const queryClient = useQueryClient();
  const headers = useJsonHeaders({}, true);
  const [tenant] = getTenantInfo();

  return useMutation(
    (body: SavedSearchAddShareSchemaBody) =>
      discoverAPI.savedSearches.addShare(body, headers, tenant),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(SAVED_SEARCHES_QUERY_KEY);
      },
      onError: (error: Error) => {
        handleServiceError(error);
      },
    }
  );
}

export function useSavedSearchRemoveShareMutate() {
  const headers = useJsonHeaders({}, true);
  const [tenant] = getTenantInfo();
  const queryClient = useQueryClient();

  return useMutation(
    (body: SavedSearchRemoveShareSchemaPOST) =>
      discoverAPI.savedSearches.removeShare(body, headers, tenant),
    {
      onSettled: (_data, _error, variables) => {
        return queryClient.invalidateQueries([
          SAVED_SEARCHES_QUERY_KEY,
          variables.id,
        ]);
      },
    }
  );
}

export function useSavedSearchDeleteMutate() {
  const headers = useJsonHeaders({}, true);
  const [tenant] = getTenantInfo();
  const queryClient = useQueryClient();

  return useMutation(
    (id: string) => discoverAPI.savedSearches.delete(id, headers, tenant),
    {
      onSuccess: () => queryClient.invalidateQueries(SAVED_SEARCHES_QUERY_KEY),
    }
  );
}

export function useSavedSearchCreateMutate() {
  const headers = useJsonHeaders({}, true);
  const [tenant] = getTenantInfo();
  const queryClient = useQueryClient();

  return useMutation(
    (payload: { id: string; body: SavedSearchSchemaBody }) => {
      const { id, body } = payload;
      return discoverAPI.savedSearches.create(id, body, headers, tenant);
    },
    {
      onSuccess: () => queryClient.invalidateQueries(SAVED_SEARCHES_QUERY_KEY),
      onError: (error: Error) => {
        handleServiceError(error);
        return Promise.reject(error);
      },
    }
  );
}
