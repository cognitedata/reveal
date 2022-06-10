import { getSavedSearches } from 'domain/savedSearches/service/network/getSavedSearches';
import { SavedSearchItem } from 'domain/savedSearches/types';

import { useQuery } from 'react-query';

import { useJsonHeaders } from 'services/service';

import { getProjectInfo } from '@cognite/react-container';

import { SAVED_SEARCHES_QUERY_KEY } from 'constants/react-query';

export const useQuerySavedSearchesList = () => {
  const headers = useJsonHeaders({}, true);
  const [tenant] = getProjectInfo();

  return useQuery<SavedSearchItem[]>(
    SAVED_SEARCHES_QUERY_KEY,
    () => getSavedSearches(headers, tenant),
    {
      enabled: true,
      retry: false,
    }
  );
};
