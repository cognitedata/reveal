import { WDL_PAGINATION_LIMITS } from 'domain/wells/constants';
import { GetAllInspectDataProps } from 'domain/wells/types';
import { getWellSDKClient } from 'domain/wells/utils/authenticate';
import { convertToIdentifiers } from 'domain/wells/utils/convertToIdentifiers';

import { fetchAllCursors } from 'utils/fetchAllCursors';

import { HoleSectionGroup } from '@cognite/sdk-wells';

export const getHoleSections = async ({
  wellboreIds,
  options,
}: GetAllInspectDataProps) => {
  return fetchAllCursors<HoleSectionGroup>({
    signal: options?.signal,
    action: getWellSDKClient().holeSections.list,
    actionProps: {
      filter: {
        wellboreIds: convertToIdentifiers(wellboreIds),
      },
      limit: WDL_PAGINATION_LIMITS.LIST,
    },
  });
};
