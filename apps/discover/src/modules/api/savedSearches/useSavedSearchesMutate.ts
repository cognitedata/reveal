import { useMutation, useQueryClient } from 'react-query';

import { log } from 'utils/log';

import { getTenantInfo } from '@cognite/react-container';
import { reportException } from '@cognite/react-errors';

import { SAVED_SEARCHES_QUERY_KEY } from 'constants/react-query';
import { useJsonHeaders } from 'modules/api/service';

import { discoverAPI } from '../service';

import { createSavedSearch, deleteSavedSearch } from './utils';

export const useSavedSearchMutate = () => {
  log('this is where we should move the saved search mutate into');
};

export function useSavedSearchAddShareMutate() {
  const queryClient = useQueryClient();
  const headers = useJsonHeaders({}, true);
  const [tenant] = getTenantInfo();

  return useMutation(
    (payload: { id: string; users: string[] }) =>
      discoverAPI.savedSearches.addShare(payload, headers, tenant),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(SAVED_SEARCHES_QUERY_KEY);
      },
      onError: (error: Error) => {
        reportException(error);
      },
    }
  );
}

export function useSavedSearchRemoveShareMutate() {
  const headers = useJsonHeaders({}, true);
  const [tenant] = getTenantInfo();
  const queryClient = useQueryClient();

  return useMutation(
    (data: { id: string; user: string }) =>
      discoverAPI.savedSearches.removeShare(
        data.id,
        data.user,
        headers,
        tenant
      ),
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
  const queryClient = useQueryClient();

  return useMutation(deleteSavedSearch, {
    onSuccess: () => queryClient.invalidateQueries(SAVED_SEARCHES_QUERY_KEY),
  });
}

export function useSavedSearchCreateMutate() {
  const queryClient = useQueryClient();

  return useMutation(createSavedSearch, {
    onSuccess: () => queryClient.invalidateQueries(SAVED_SEARCHES_QUERY_KEY),
  });
}
