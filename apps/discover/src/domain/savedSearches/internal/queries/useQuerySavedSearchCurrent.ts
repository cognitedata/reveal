import { SAVED_SEARCHES_CURRENT_KEY } from 'domain/savedSearches/constants';

import { useQuery } from 'react-query';

import { discoverAPI, useJsonHeaders } from 'services/service';

import { getTenantInfo } from '@cognite/react-container';

import { SAVED_SEARCHES_QUERY_KEY_CURRENT } from 'constants/react-query';

export const useQuerySavedSearchCurrent = () => {
  const headers = useJsonHeaders({}, true);
  const [tenant] = getTenantInfo();

  return useQuery(
    SAVED_SEARCHES_QUERY_KEY_CURRENT,
    () =>
      discoverAPI.savedSearches.get(
        SAVED_SEARCHES_CURRENT_KEY,
        headers,
        tenant
      ),
    {
      enabled: true,
      retry: false,
    }
  );
};
