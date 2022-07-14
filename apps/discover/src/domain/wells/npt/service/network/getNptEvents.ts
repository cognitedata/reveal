import { WDL_PAGINATION_LIMITS } from 'domain/wells/constants';
import { GetAllInspectDataProps } from 'domain/wells/types';
import { getWellSDKClient } from 'domain/wells/utils/authenticate';
import { convertToIdentifiers } from 'domain/wells/utils/convertToIdentifiers';

import { fetchAllCursors } from 'utils/fetchAllCursors';

import { Npt } from '@cognite/sdk-wells';

export const getNptEvents = async ({
  wellboreIds,
  options,
}: GetAllInspectDataProps) => {
  return fetchAllCursors<Npt>({
    signal: options?.signal,
    action: getWellSDKClient().npt.list,
    actionProps: {
      filter: {
        wellboreIds: convertToIdentifiers(wellboreIds),
      },
      limit: WDL_PAGINATION_LIMITS.LIST,
    },
  });
};
