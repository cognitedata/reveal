import get from 'lodash/get';

import { WellSearchResult } from 'modules/wellSearch/hooks/useWellSearchResultQuery';
import {
  mapV3ToV2WellItems,
  mapWellFilterToWellFilterRequest,
} from 'modules/wellSearch/sdk/utils';
import { getWellSDKClient as getWellSDKClientV3 } from 'modules/wellSearch/sdk/v3';
import { CommonWellFilter } from 'modules/wellSearch/types';
import { normalizeWells } from 'modules/wellSearch/utils/wells';

export const getListWells = async (
  wellFilter: CommonWellFilter
): Promise<WellSearchResult> => {
  const fetching = getWellSDKClientV3().wells.list({
    ...mapWellFilterToWellFilterRequest(wellFilter),
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
