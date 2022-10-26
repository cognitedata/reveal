import { deleteSavedSearch } from 'domain/savedSearches/service/network/deleteSavedSearch';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getProjectInfo } from '@cognite/react-container';

import { SAVED_SEARCHES_QUERY_KEY } from 'constants/react-query';
import { useJsonHeaders } from 'hooks/useJsonHeaders';

export function useSavedSearchDeleteMutate() {
  const headers = useJsonHeaders({}, true);
  const [tenant] = getProjectInfo();
  const queryClient = useQueryClient();

  return useMutation((id: string) => deleteSavedSearch(id, headers, tenant), {
    onSuccess: () => queryClient.invalidateQueries([SAVED_SEARCHES_QUERY_KEY]),
  });
}
