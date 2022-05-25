import chunk from 'lodash/chunk';
import flatten from 'lodash/flatten';
import { getWellSDKClient } from 'services/wellSearch/sdk/authenticate';

import { Trajectory, TrajectoryItems } from '@cognite/sdk-wells-v3';

import { toIdentifier } from 'modules/wellSearch/sdk/utils';
import { WellboreId } from 'modules/wellSearch/types';

import { CHUNK_LIMIT } from './getTrajectoriesData';

export const getTrajectories = async (
  wellboreIds: WellboreId[]
): Promise<Trajectory[]> => {
  const idChunkList = chunk(wellboreIds, CHUNK_LIMIT);

  return flatten(
    await Promise.all(
      idChunkList.map((wellboreIdChunk) =>
        getWellSDKClient()
          .trajectories.list({
            filter: { wellboreIds: wellboreIdChunk.map(toIdentifier) },
            limit: CHUNK_LIMIT,
          })
          .then((trajectoryItems: TrajectoryItems) => trajectoryItems.items)
      )
    )
  );
};
