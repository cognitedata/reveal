import { UseQueryResult, useQuery } from 'react-query';

import { discoverAPI, useJsonHeaders } from 'services/service';

import { StatsGetResponse } from '@cognite/discover-api-types';

import { ONLY_FETCH_ONCE, STATS_QUERY_KEY } from 'constants/react-query';

export const useStatsGetQuery: () => UseQueryResult<StatsGetResponse> = () => {
  const headers = useJsonHeaders({}, true);
  return useQuery<StatsGetResponse>(
    STATS_QUERY_KEY.GET,
    () => discoverAPI.stats.get({ headers }),
    {
      ...ONLY_FETCH_ONCE,
      enabled: false,
    }
  );
};
