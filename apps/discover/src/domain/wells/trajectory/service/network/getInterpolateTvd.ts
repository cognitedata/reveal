import isEmpty from 'lodash/isEmpty';
import { getWellSDKClient } from 'services/wellSearch/sdk';

import {
  TrajectoryInterpolationItems,
  TrajectoryInterpolationRequest,
  TrueVerticalDepths,
} from '@cognite/sdk-wells-v3';

import { getEmptyTvd } from '../../../utils/getEmptyTvd';
import { ResponseItemType } from '../../types';

export const getInterpolateTvd = async (
  responseItems: ResponseItemType[],
  trajectoryInterpolationRequests: TrajectoryInterpolationRequest[]
): Promise<TrueVerticalDepths[]> => {
  return getWellSDKClient()
    .trajectories.interpolate({
      items: trajectoryInterpolationRequests,
      ignoreUnknownMeasuredDepths: true,
      ignoreMissingTrajectories: true,
    })
    .then((interpolationItems: TrajectoryInterpolationItems) => {
      // we need this otherwise there is a runtime error resulting in an infinite loop
      if (isEmpty(interpolationItems.items)) {
        return getEmptyTvd(responseItems);
      }
      return interpolationItems.items;
    });
};
