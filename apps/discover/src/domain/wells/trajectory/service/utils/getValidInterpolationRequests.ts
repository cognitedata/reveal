import isEmpty from 'lodash/isEmpty';

import { TrajectoryInterpolationRequest } from '@cognite/sdk-wells';

export const getValidInterpolationRequests = (
  trajectoryInterpolationRequests: TrajectoryInterpolationRequest[]
) => {
  return trajectoryInterpolationRequests.filter(({ measuredDepths }) => {
    return !isEmpty(measuredDepths);
  });
};
