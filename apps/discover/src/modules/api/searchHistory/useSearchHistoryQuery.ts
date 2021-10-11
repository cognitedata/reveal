import { useQuery } from 'react-query';

import { getTenantInfo } from '@cognite/react-container';

import { SEARCH_HISTORY_KEY } from 'constants/react-query';

import { discoverAPI, getJsonHeaders } from '../service';

export const useSearchHistoryListQuery = () => {
  const headers = getJsonHeaders({}, true);
  const [tenant] = getTenantInfo();

  return useQuery(SEARCH_HISTORY_KEY.LIST, () =>
    discoverAPI.searchHistory
      .list(headers, tenant)
      .then((searchHistory) => searchHistory)
  );
};
