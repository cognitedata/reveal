import { GetAllInspectDataProps } from 'domain/wells/types';
import { getWellSDKClient } from 'domain/wells/utils/authenticate';
import { convertToIdentifiers } from 'domain/wells/utils/convertToIdentifiers';

import { fetchAllCursors } from 'utils/fetchAllCursors';

import { CasingSchematic } from '@cognite/sdk-wells';

export const getCasingSchematics = async ({
  wellboreIds,
  options,
}: GetAllInspectDataProps) => {
  return fetchAllCursors<CasingSchematic>({
    signal: options?.signal,
    action: getWellSDKClient().casings.list,
    actionProps: {
      filter: {
        wellboreIds: convertToIdentifiers(wellboreIds),
      },
    },
  });
};
