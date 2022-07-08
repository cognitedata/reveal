import { filters } from 'domain/wells/well/internal/filters';

import { isNumberTuple } from 'utils/types/isNumberTuple';
import { toDistanceUnitEnum } from 'utils/units/toDistanceUnitEnum';

import { WellFilter } from '@cognite/sdk-wells-v3';

import { UserPreferredUnit } from 'constants/units';

export const getMDFilter = (
  value?: unknown,
  unit?: UserPreferredUnit
): Pick<WellFilter, 'trajectories'> => {
  if (isNumberTuple(value) && unit) {
    return {
      trajectories: {
        maxMeasuredDepth: filters.toRange(value, toDistanceUnitEnum(unit)),
      },
    };
  }

  return {};
};
