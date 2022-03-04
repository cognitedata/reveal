import { UseQueryResult, useQuery } from 'react-query';

import { discoverAPI, useJsonHeaders } from 'services/service';

import { ONLY_FETCH_ONCE, STATS_QUERY_KEY } from 'constants/react-query';

import { Stats } from './types';

// NOT USED IN DISCOVER ANYMORE
// keep around for until 01-06-2022 then delete if not used
// find from cdf
// export const useStatsFindQuery: () => UseQueryResult<Stats, unknown> = () => {
//   const headers = useJsonHeaders();

//   return useQuery<Stats>(
//     STATS_QUERY_KEY.FIND,
//     () => discoverAPI.stats.find({ headers }),
//     {
//       ...ONLY_FETCH_ONCE,
//       enabled: false,
//     }
//   );
// };

// get from db-service
export const useStatsGetQuery: () => UseQueryResult<Stats, unknown> = () => {
  const headers = useJsonHeaders({}, true);
  return useQuery<Stats>(
    STATS_QUERY_KEY.GET,
    () => discoverAPI.stats.get({ headers }),
    {
      ...ONLY_FETCH_ONCE,
      enabled: false,
    }
  );
};
