import { SavedSearchItem } from 'domain/savedSearches/types';

import { useQuery } from 'react-query';

import { discoverAPI, useJsonHeaders } from 'services/service';

import { getTenantInfo } from '@cognite/react-container';

import { SAVED_SEARCHES_QUERY_KEY } from 'constants/react-query';

export const useQuerySavedSearchesList = () => {
  const headers = useJsonHeaders({}, true);
  const [tenant] = getTenantInfo();

  return useQuery<SavedSearchItem[]>(
    SAVED_SEARCHES_QUERY_KEY,
    () => discoverAPI.savedSearches.list(headers, tenant),
    {
      enabled: true,
      retry: false,
    }
  );
};
