import { STATS_ERROR } from 'domain/stats/constants';
import { StatsApiResult } from 'domain/stats/service/types';

import { fetchGet, FetchHeaders } from 'utils/fetch';

import { getTenantInfo } from '@cognite/react-container';

import { SIDECAR } from 'constants/app';

export const getStats = async ({ headers }: { headers: FetchHeaders }) => {
  const [tenant] = getTenantInfo();

  return fetchGet<StatsApiResult>(
    `${SIDECAR.discoverApiBaseUrl}/${tenant}/stats`,
    {
      headers,
    }
  ).then((response) => {
    if (response.success) {
      return response.data.stats;
    }

    throw Error(STATS_ERROR);
  });
};
