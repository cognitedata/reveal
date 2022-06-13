import convert from 'convert-units';

import { OtherConversionUnit, OTHER_CONVERSION_UNITS } from './constants';

export const getSafeUnit = (
  unit: convert.Unit | OtherConversionUnit
): convert.Unit => {
  if (unit in OTHER_CONVERSION_UNITS) {
    return OTHER_CONVERSION_UNITS[unit as OtherConversionUnit];
  }
  return unit as convert.Unit;
};
