import { TrajectoryInternal } from '../types';
import { compareTrajectoryDepth } from '../utils/compareTrajectoryDepth';

type TrajectoryType = Pick<
  TrajectoryInternal,
  'maxMeasuredDepth' | 'isDefinitive'
>;

export const sortTrajectoriesByMaxMeasuredDepth = <T extends TrajectoryType>(
  data: T[]
) => {
  return data.sort((trajectory1, trajectory2) =>
    compareTrajectoryDepth(trajectory1, trajectory2, 'maxMeasuredDepth')
  );
};
