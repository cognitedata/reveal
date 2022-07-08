import { GetAllInspectDataProps } from 'domain/wells/types';
import { getWellSDKClient } from 'domain/wells/utils/authenticate';
import { convertToIdentifiers } from 'domain/wells/utils/convertToIdentifiers';

import { fetchAllCursors } from 'utils/fetchAllCursors';

import { Trajectory } from '@cognite/sdk-wells';

export const getTrajectories = async ({
  wellboreIds,
  options,
}: GetAllInspectDataProps) => {
  return fetchAllCursors<Trajectory>({
    signal: options?.signal,
    action: getWellSDKClient().trajectories.list,
    actionProps: {
      filter: {
        wellboreIds: convertToIdentifiers(wellboreIds),
      },
    },
  });
};
