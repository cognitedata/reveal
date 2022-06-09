import { useMutation, useQueryClient } from 'react-query';

import { useJsonHeaders } from 'services/service';

import { SavedSearchRemoveShareSchemaPOST } from '@cognite/discover-api-types';
import { getTenantInfo } from '@cognite/react-container';

import { SAVED_SEARCHES_QUERY_KEY } from 'constants/react-query';

import { discoverAPI } from '../../../../services/service';

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
