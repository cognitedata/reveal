import { filters } from 'domain/wells/well/internal/filters';

import { isNumberTuple } from 'utils/types/isNumberTuple';
import { toDistanceUnitEnum } from 'utils/units/toDistanceUnitEnum';

import { WellFilter } from '@cognite/sdk-wells';

import { UserPreferredUnit } from 'constants/units';

export const getWaterDepthFilter = (
  value?: unknown,
  unit?: UserPreferredUnit
): Pick<WellFilter, 'waterDepth'> => {
  if (isNumberTuple(value) && unit) {
    return {
      waterDepth: filters.toRange(value, toDistanceUnitEnum(unit)),
    };
  }

  return {};
};
