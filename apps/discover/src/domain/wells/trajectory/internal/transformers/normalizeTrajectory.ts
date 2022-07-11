import { changeUnitTo } from 'utils/units';

import { Trajectory } from '@cognite/sdk-wells';

import { UserPreferredUnit } from 'constants/units';

import { TrajectoryInternal } from '../types';

import { normalizeDoglegSeverity } from './normalizeDoglegSeverity';

export const normalizeTrajectory = (
  rawTrajectory: Trajectory,
  userPreferredUnit: UserPreferredUnit
): TrajectoryInternal => {
  const { maxMeasuredDepth, maxTrueVerticalDepth, maxDoglegSeverity } =
    rawTrajectory;
  const { distanceUnit } = maxDoglegSeverity.unit;

  return {
    ...rawTrajectory,
    maxMeasuredDepth: changeUnitTo(
      maxMeasuredDepth,
      distanceUnit,
      userPreferredUnit
    ),
    maxTrueVerticalDepth: changeUnitTo(
      maxTrueVerticalDepth,
      distanceUnit,
      userPreferredUnit
    ),
    maxDoglegSeverity: normalizeDoglegSeverity(maxDoglegSeverity),
  };
};
