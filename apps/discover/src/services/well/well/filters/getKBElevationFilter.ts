import { filters } from 'dataLayers/wells/filters';
import { isNumberTuple } from 'utils/types/isNumberTuple';

import { WellFilter } from '@cognite/sdk-wells-v3';

import { UserPreferredUnit } from 'constants/units';
import { unitToLengthUnitEnum } from 'modules/wellSearch/sdk/utils';

export const getKBElevationFilter = (
  value?: unknown,
  unit?: UserPreferredUnit
): Pick<WellFilter, 'datum'> => {
  if (isNumberTuple(value) && unit) {
    return {
      datum: filters.toRange(value, unitToLengthUnitEnum(unit)),
    };
  }

  return {};
};
