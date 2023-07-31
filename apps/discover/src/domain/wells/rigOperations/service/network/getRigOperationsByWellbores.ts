import { WDL_PAGINATION_LIMITS } from 'domain/wells/constants';
import { GetAllInspectDataProps } from 'domain/wells/types';
import { getWellSDKClient } from 'domain/wells/utils/authenticate';
import { convertToIdentifiers } from 'domain/wells/utils/convertToIdentifiers';

import { fetchAllCursors } from 'utils/fetchAllCursors';

import { RigOperation } from '@cognite/sdk-wells';

export const getRigOperationsByWellbores = async ({
  wellboreIds,
  options,
}: GetAllInspectDataProps) => {
  return fetchAllCursors<RigOperation>({
    signal: options?.signal,
    action: getWellSDKClient().rigOperations.list,
    actionProps: {
      filter: {
        wellboreIds: convertToIdentifiers(wellboreIds),
      },
      limit: WDL_PAGINATION_LIMITS.LIST,
    },
  });
};
