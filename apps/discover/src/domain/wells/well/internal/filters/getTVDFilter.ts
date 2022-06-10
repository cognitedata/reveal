import { filters } from 'domain/wells/well/internal/filters';

import { isNumberTuple } from 'utils/types/isNumberTuple';

import { WellFilter } from '@cognite/sdk-wells-v3';

import { UserPreferredUnit } from 'constants/units';
import { unitToLengthUnitEnum } from 'modules/wellSearch/sdk/utils';

export const getTVDFilter = (
  value?: unknown,
  unit?: UserPreferredUnit
): Pick<WellFilter, 'trajectories'> => {
  if (isNumberTuple(value) && unit) {
    return {
      trajectories: {
        maxTrueVerticalDepth: filters.toRange(
          value,
          unitToLengthUnitEnum(unit)
        ),
      },
    };
  }

  return {};
};
