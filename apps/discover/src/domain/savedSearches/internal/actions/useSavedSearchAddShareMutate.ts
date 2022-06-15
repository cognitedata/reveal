import { addShareSavedSearch } from 'domain/savedSearches/service/network/addShareSavedSearch';

import { useMutation, useQueryClient } from 'react-query';

import { handleServiceError } from 'utils/errors';

import { SavedSearchAddShareSchemaBody } from '@cognite/discover-api-types';
import { getProjectInfo } from '@cognite/react-container';

import { SAVED_SEARCHES_QUERY_KEY } from 'constants/react-query';
import { useJsonHeaders } from 'hooks/useJsonHeaders';

export function useSavedSearchAddShareMutate() {
  const queryClient = useQueryClient();
  const headers = useJsonHeaders({}, true);
  const [tenant] = getProjectInfo();

  return useMutation(
    (body: SavedSearchAddShareSchemaBody) =>
      addShareSavedSearch(body, headers, tenant),
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
