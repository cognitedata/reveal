import { toFixedNumberFromNumber } from 'utils/number';
import { changeUnitTo } from 'utils/units';

import { UserPreferredUnit } from 'constants/units';

// This converts the unit if necessary and get a number with fixed place
export const getUnitConvertedFixedValue = (
  value: number,
  fromUnit: convert.Unit,
  userPreferredUnit?: UserPreferredUnit
) => {
  return toFixedNumberFromNumber(
    changeUnitTo(
      value,
      fromUnit,
      userPreferredUnit || UserPreferredUnit.FEET
    ) || 0,
    2
  );
};
