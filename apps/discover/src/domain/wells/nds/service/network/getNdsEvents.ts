import { WDL_PAGINATION_LIMITS } from 'domain/wells/constants';
import { GetAllInspectDataProps } from 'domain/wells/types';
import { getWellSDKClient } from 'domain/wells/utils/authenticate';
import { convertToIdentifiers } from 'domain/wells/utils/convertToIdentifiers';

import { fetchAllCursors } from 'utils/fetchAllCursors';

import { Nds } from '@cognite/sdk-wells';

export const getNdsEvents = async ({
  wellboreIds,
  options,
}: GetAllInspectDataProps) => {
  return fetchAllCursors<Nds>({
    signal: options?.signal,
    action: getWellSDKClient().nds.list,
    actionProps: {
      filter: {
        wellboreIds: convertToIdentifiers(wellboreIds),
      },
      limit: WDL_PAGINATION_LIMITS.LIST,
    },
  });
};
