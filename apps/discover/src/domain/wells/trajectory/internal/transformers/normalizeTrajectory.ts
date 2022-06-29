import { Trajectory } from '@cognite/sdk-wells-v3';

import { TrajectoryInternal } from '../types';

import { normalizeDoglegSeverity } from './normalizeDoglegSeverity';

export const normalizeTrajectory = (
  rawTrajectory: Trajectory
): TrajectoryInternal => {
  const { maxDoglegSeverity } = rawTrajectory;

  return {
    ...rawTrajectory,
    maxDoglegSeverity: normalizeDoglegSeverity(maxDoglegSeverity),
  };
};
