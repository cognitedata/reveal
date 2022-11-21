import { getWellSDKClient } from 'domain/wells/utils/authenticate';

import isEmpty from 'lodash/isEmpty';
import { handleServiceError } from 'utils/errors';

import {
  TrajectoryInterpolationItems,
  TrajectoryInterpolationRequest,
  TrueVerticalDepths,
} from '@cognite/sdk-wells';

import { EMPTY_ARRAY } from 'constants/empty';

import { SOMETHING_WENT_WRONG_FETCHING_TVD } from '../../constants';
import { ResponseItemType } from '../types';
import { getEmptyTvd } from '../utils/getEmptyTvd';
import { getValidInterpolationRequests } from '../utils/getValidInterpolationRequests';

export const getInterpolateTvd = async (
  responseItems: ResponseItemType[],
  trajectoryInterpolationRequests: TrajectoryInterpolationRequest[]
): Promise<TrueVerticalDepths[]> => {
  const validRequests = getValidInterpolationRequests(
    trajectoryInterpolationRequests
  );

  if (isEmpty(validRequests)) {
    return EMPTY_ARRAY;
  }

  return getWellSDKClient()
    .trajectories.interpolate({
      items: validRequests,
      ignoreUnknownMeasuredDepths: true,
      ignoreMissingTrajectories: true,
    })
    .then((interpolationItems: TrajectoryInterpolationItems) => {
      // we need this otherwise there is a runtime error resulting in an infinite loop
      if (isEmpty(interpolationItems.items)) {
        return getEmptyTvd(responseItems);
      }
      return interpolationItems.items;
    })
    .catch((error) =>
      handleServiceError(error, EMPTY_ARRAY, SOMETHING_WENT_WRONG_FETCHING_TVD)
    );
};
