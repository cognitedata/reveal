import { stats } from 'domain/stats/service/network/stats';

import { UseQueryResult, useQuery } from 'react-query';

import { StatsGetResponse } from '@cognite/discover-api-types';

import { ONLY_FETCH_ONCE, STATS_QUERY_KEY } from 'constants/react-query';
import { useJsonHeaders } from 'hooks/useJsonHeaders';

export const useStatsGetQuery: () => UseQueryResult<StatsGetResponse> = () => {
  const headers = useJsonHeaders({}, true);
  return useQuery<StatsGetResponse>(
    STATS_QUERY_KEY.GET,
    () => stats.get({ headers }),
    {
      ...ONLY_FETCH_ONCE,
      enabled: false,
    }
  );
};
