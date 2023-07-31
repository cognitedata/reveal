import { getWellSDKClient } from 'domain/wells/utils/authenticate';

import { TrajectoryData } from '@cognite/sdk-wells';

import { TrajectoriesDataRequest } from '../types';
import { getTrajectoryDataRequestDepthUnitBody } from '../utils/getTrajectoryDataRequestDepthUnitBody';

export const getTrajectoriesData = ({
  sequenceExternalIds,
  unit,
}: TrajectoriesDataRequest): Promise<TrajectoryData[]> => {
  const depthUnitRequestBody = getTrajectoryDataRequestDepthUnitBody(unit);

  return Promise.all(
    Array.from(sequenceExternalIds).map((sequenceExternalId) =>
      getWellSDKClient().trajectories.listData({
        sequenceExternalId,
        ...depthUnitRequestBody,
      })
    )
  );
};
