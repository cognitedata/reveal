import { SavedSearchContent } from 'domain/savedSearches/types';

import { useQuery } from 'react-query';

import { discoverAPI, useJsonHeaders } from 'services/service';

import { getTenantInfo } from '@cognite/react-container';

import { SAVED_SEARCHES_QUERY_KEY } from 'constants/react-query';

export const useQuerySavedSearcheGetOne = (id: string) => {
  const headers = useJsonHeaders({}, true);
  const [tenant] = getTenantInfo();

  return useQuery<SavedSearchContent>(
    [SAVED_SEARCHES_QUERY_KEY, id],
    () =>
      discoverAPI.savedSearches
        .get(id, headers, tenant)
        .then((response) => response as SavedSearchContent),
    {
      enabled: true,
      retry: false,
    }
  );
};
