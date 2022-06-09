import { useMutation, useQueryClient } from 'react-query';

import { useJsonHeaders } from 'services/service';
import { handleServiceError } from 'utils/errors';

import { SavedSearchAddShareSchemaBody } from '@cognite/discover-api-types';
import { getTenantInfo } from '@cognite/react-container';

import { SAVED_SEARCHES_QUERY_KEY } from 'constants/react-query';

import { discoverAPI } from '../../../../services/service';

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
