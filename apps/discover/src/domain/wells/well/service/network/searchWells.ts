import { getWellSDKClient } from 'services/wellSearch/sdk/authenticate';

import { WellFilter } from '@cognite/sdk-wells-v3';

export const searchWells = async (filter: WellFilter, query: string) => {
  const results = await getWellSDKClient().wells.search({
    filter,
    search: query ? { query } : undefined,
    outputCrs: undefined,
    limit: undefined,
    aggregates: ['count'],
  });

  const totals = {
    totalWells: results.wellsCount,
    totalWellbores: results.wellboresCount,
  };

  // const normalizedResponse = mapV3ToV2WellItems(results);

  return {
    wells: results.items || [],
    ...totals,
  };
};
