import { fetchGet, FetchHeaders } from 'utils/fetch';

import { getTenantInfo } from '@cognite/react-container';

import { SIDECAR } from 'constants/app';

import { StatsApiResult } from './types';

// REMEMBER: don't call this stuff directly,
// always use it via the react-query hooks
export const stats = {
  get: async ({ headers }: { headers: FetchHeaders }) => {
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

      throw Error('Error getting stats');
    });
  },
};
