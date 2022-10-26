import { removeShareSavedSearch } from 'domain/savedSearches/service/network/removeShareSavedSearch';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { SavedSearchRemoveShareSchemaPOST } from '@cognite/discover-api-types';
import { getProjectInfo } from '@cognite/react-container';

import { SAVED_SEARCHES_QUERY_KEY } from 'constants/react-query';
import { useJsonHeaders } from 'hooks/useJsonHeaders';

export function useSavedSearchRemoveShareMutate() {
  const headers = useJsonHeaders({}, true);
  const [tenant] = getProjectInfo();
  const queryClient = useQueryClient();

  return useMutation(
    (body: SavedSearchRemoveShareSchemaPOST) =>
      removeShareSavedSearch(body, headers, tenant),
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
