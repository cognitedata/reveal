import get from 'lodash/get';
import { getWellSDKClient } from 'services/wellSearch/sdk/authenticate';

import { WellFilter } from '@cognite/sdk-wells-v3';

import { WellSearchResult } from 'modules/wellSearch/hooks/useWellSearchResultQuery';
import { mapV3ToV2WellItems } from 'modules/wellSearch/sdk/utils';
import { normalizeWells } from 'modules/wellSearch/utils/wells';

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

  const normalizedResponse = mapV3ToV2WellItems(fetchResponse);
  const wellItems = normalizedResponse.items;
  // const wellItems = get<Well[]>(normalizedResponse, 'items', [])

  const wellsResponse = normalizeWells(wellItems);

  return {
    wells: wellsResponse,
    ...totals,
  };
};

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

  const normalizedResponse = mapV3ToV2WellItems(results);

  const wellsResponse = normalizeWells(get(normalizedResponse, 'items', []));

  return {
    wells: wellsResponse,
    ...totals,
  };
};
