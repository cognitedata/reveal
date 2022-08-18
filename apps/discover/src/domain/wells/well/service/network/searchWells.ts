import { getWellSDKClient } from 'domain/wells/utils/authenticate';

import { Well, WellFilter } from '@cognite/sdk-wells';

export const searchWells = async (filter: WellFilter, query: string) => {
  const results = await getWellSDKClient().wells.search({
    filter,
    search: query ? { query } : undefined,
    outputCrs: 'EPSG:4326',
    limit: undefined,
    aggregates: ['count'],
  });

  const totals = {
    totalWells: results.wellsCount,
    totalWellbores: results.wellboresCount,
  };

  // const normalizedResponse = mapV3ToV2WellItems(results);

  return {
    wells: (results.items || []) as Array<Well>,
    ...totals,
  };
};
