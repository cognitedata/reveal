import { useMutation, useQueryClient } from 'react-query';

import { useJsonHeaders } from 'services/service';

import { getTenantInfo } from '@cognite/react-container';

import { SAVED_SEARCHES_QUERY_KEY } from 'constants/react-query';

import { discoverAPI } from '../../../../services/service';

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
