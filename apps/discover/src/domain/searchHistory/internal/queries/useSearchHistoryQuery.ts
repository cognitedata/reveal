import { useQuery } from 'react-query';

import { getTenantInfo } from '@cognite/react-container';

import { SEARCH_HISTORY_KEY } from 'constants/react-query';
import { useJsonHeaders } from 'hooks/useJsonHeaders';

import { getSearchHistories } from '../../service/network/getSearchHistories';

export const useSearchHistoryListQuery = () => {
  const headers = useJsonHeaders({}, true);
  const [tenant] = getTenantInfo();

  return useQuery(SEARCH_HISTORY_KEY.LIST, () =>
    getSearchHistories.list(headers, tenant)
  );
};
