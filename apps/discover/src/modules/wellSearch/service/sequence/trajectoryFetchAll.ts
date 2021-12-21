import { Wellbore, Trajectory } from '@cognite/sdk-wells-v3';

import { fetchAllCursors } from '_helpers/fetchAllCursors';
import { toIdentifier } from 'modules/wellSearch/sdk/utils';
import { getWellSDKClient } from 'modules/wellSearch/sdk/v3';

export const fetchAllTrajectories = async ({
  wellboreIds,
}: {
  wellboreIds: Set<Wellbore['matchingId']>;
}) => {
  return fetchAllCursors<Trajectory>({
    action: getWellSDKClient().trajectories.list,
    actionProps: {
      sequenceExternalId: {
        wellboreIds: Array.from(wellboreIds).map(toIdentifier),
      },
      // let's just use max for now
      // limit: CHUNK_LIMIT,
    },
  });
};
