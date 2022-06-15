import { getSavedSearch } from 'domain/savedSearches/service/network/getSavedSearch';
import { SavedSearchContent } from 'domain/savedSearches/types';

import { useQuery } from 'react-query';

import { getProjectInfo } from '@cognite/react-container';

import { SAVED_SEARCHES_QUERY_KEY } from 'constants/react-query';
import { useJsonHeaders } from 'hooks/useJsonHeaders';

export const useQuerySavedSearcheGetOne = (id: string) => {
  const headers = useJsonHeaders({}, true);
  const [tenant] = getProjectInfo();

  return useQuery<SavedSearchContent>(
    [SAVED_SEARCHES_QUERY_KEY, id],
    () =>
      getSavedSearch(id, headers, tenant).then(
        (response) => response as SavedSearchContent
      ),
    {
      enabled: true,
      retry: false,
    }
  );
};
