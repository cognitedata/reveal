import { useMutation, useQueryClient } from 'react-query';

import { useJsonHeaders } from 'services/service';
import { handleServiceError } from 'utils/errors';

import { SavedSearchSchemaBody } from '@cognite/discover-api-types';
import { getTenantInfo } from '@cognite/react-container';

import { SAVED_SEARCHES_QUERY_KEY } from 'constants/react-query';

import { discoverAPI } from '../../../../services/service';

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
