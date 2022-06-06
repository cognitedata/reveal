import { getWellSDKClient } from 'domain/wells/utils/authenticate';
import { WellSearchResult } from 'domain/wells/well/internal/queries/useWellSearchResultQuery';

import { WellFilter } from '@cognite/sdk-wells-v3';

// THIS IS CURRENTLY NOT USED
export const getListWells = async (
  wellFilter: WellFilter,
  query: string
): Promise<WellSearchResult> => {
  const fetching = getWellSDKClient().wells.list({
    filter: wellFilter,
    search: { query },
    outputCrs: undefined,
    limit: undefined,
    aggregates: ['count'],
  });

  const fetchResponse = await fetching;

  const totals = {
    totalWells: fetchResponse.wellsCount,
    totalWellbores: fetchResponse.wellboresCount,
  };

  // export const mapV3ToV2WellItems = (wellItems: WellItemsV3) => {
  //   return {
  //     ...wellItems,
  //     items: wellItems.items.map(mapV3ToV2Well),
  //   };
  // };

  // export const mapV3ToV2Well = (well: WellV3): Well => {
  //   const wellbores = well.wellbores?.map(mapV3ToV2Wellbore) || [];
  //   return {
  //     ...well,
  //     id: well.matchingId,
  //     spudDate: new Date(well.spudDate || ''),
  //     wellhead: { id: 0, ...well.wellhead },
  //     sources: well.sources.map((source) => source.sourceName),
  //     wellbores,
  //     // wellbores: () => Promise.resolve(wellbores),
  //     sourceAssets: () => Promise.resolve([]),
  //   } as Well;
  // };
  // const wellItems = normalizedResponse.items;

  // const normalizedResponse = normalize(fetchResponse);
  const wellItems = fetchResponse.items;
  // const wellItems = get<Well[]>(normalizedResponse, 'items', [])

  return {
    wells: wellItems,
    ...totals,
  };
};
