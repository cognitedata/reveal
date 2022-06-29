import { getWellSDKClient } from 'domain/wells/utils/authenticate';

import { fetchAllCursors, FetchOptions } from 'utils/fetchAllCursors';

import { Wellbore, Trajectory } from '@cognite/sdk-wells-v3';

import { toIdentifier } from 'modules/wellSearch/sdk/utils';

export const getAllTrajectories = async ({
  wellboreIds,
  options,
}: {
  wellboreIds: Set<Wellbore['matchingId']>;
  options?: FetchOptions;
}) => {
  return fetchAllCursors<Trajectory>({
    signal: options?.signal,
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
