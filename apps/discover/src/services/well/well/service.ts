import get from 'lodash/get';

import { WellFilter } from '@cognite/sdk-wells-v3';

import { WellSearchResult } from 'modules/wellSearch/hooks/useWellSearchResultQuery';
import { mapV3ToV2WellItems } from 'modules/wellSearch/sdk/utils';
import { getWellSDKClient as getWellSDKClientV3 } from 'modules/wellSearch/sdk/v3';
import { normalizeWells } from 'modules/wellSearch/utils/wells';

export const getListWells = async (
  wellFilter: WellFilter,
  query: string
): Promise<WellSearchResult> => {
  const fetching = getWellSDKClientV3().wells.list({
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

  const wells = normalizeWells(get(normalizedResponse, 'items', []));

  return {
    wells,
    ...totals,
  };
};
