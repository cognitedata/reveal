import { changeUnitTo } from 'utils/units';

import { DistanceRange } from '@cognite/sdk-wells-v3';

import { UserPreferredUnit } from 'constants/units';

import { DistanceRangeInternal } from '../types';

export const normalizeDistanceRange = (
  rawDistanceRange: DistanceRange,
  unit: UserPreferredUnit
): DistanceRangeInternal => {
  const { min, max, unit: fromUnit } = rawDistanceRange;

  return {
    min: min && changeUnitTo(min, fromUnit, unit),
    max: max && changeUnitTo(max, fromUnit, unit),
    unit,
  };
};
