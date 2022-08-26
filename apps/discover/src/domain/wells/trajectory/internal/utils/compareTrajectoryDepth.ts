import isUndefined from 'lodash/isUndefined';

import { TrajectoryInternal } from '../types';

type TrajectoryType = Pick<
  TrajectoryInternal,
  'maxMeasuredDepth' | 'maxTrueVerticalDepth' | 'isDefinitive'
>;

export const compareTrajectoryDepth = <T extends TrajectoryType>(
  trajectory1: T,
  trajectory2: T,
  depthAccessor: 'maxMeasuredDepth' | 'maxTrueVerticalDepth'
) => {
  const depth1 = trajectory1[depthAccessor];
  const depth2 = trajectory2[depthAccessor];

  if (isUndefined(depth1)) {
    return 1;
  }

  if (isUndefined(depth2)) {
    return -1;
  }

  if (trajectory1.isDefinitive !== trajectory2.isDefinitive) {
    if (trajectory1.isDefinitive) {
      return -1;
    }

    if (trajectory2.isDefinitive) {
      return 1;
    }
  }

  return depth2 - depth1;
};
