import { WDL_PAGINATION_LIMITS } from 'domain/wells/constants';
import { GetAllInspectDataProps } from 'domain/wells/types';
import { getWellSDKClient } from 'domain/wells/utils/authenticate';
import { convertToIdentifiers } from 'domain/wells/utils/convertToIdentifiers';

import { fetchAllCursors } from 'utils/fetchAllCursors';

import { WellTops } from '@cognite/sdk-wells';

export const getWellTops = async ({
  wellboreIds,
  options,
}: GetAllInspectDataProps) => {
  return fetchAllCursors<WellTops>({
    signal: options?.signal,
    action: getWellSDKClient().wellTops.list,
    actionProps: {
      filter: {
        wellboreIds: convertToIdentifiers(wellboreIds),
      },
      limit: WDL_PAGINATION_LIMITS.LIST,
    },
  });
};
