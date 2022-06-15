import { createSavedSearch } from 'domain/savedSearches/service/network/createSavedSearch';

import { useMutation, useQueryClient } from 'react-query';

import { handleServiceError } from 'utils/errors';

import { SavedSearchSchemaBody } from '@cognite/discover-api-types';
import { getProjectInfo } from '@cognite/react-container';

import { SAVED_SEARCHES_QUERY_KEY } from 'constants/react-query';
import { useJsonHeaders } from 'hooks/useJsonHeaders';

export function useSavedSearchCreateMutate() {
  const headers = useJsonHeaders({}, true);
  const [tenant] = getProjectInfo();
  const queryClient = useQueryClient();

  return useMutation(
    (payload: { id: string; body: SavedSearchSchemaBody }) => {
      const { id, body } = payload;
      return createSavedSearch(id, body, headers, tenant);
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
