import { Distance } from 'convert-units';
import {
  ConvertedDistance,
  OtherConversionUnit,
  OTHER_CONVERSION_UNITS,
} from 'utils/units/constants';

import { DistanceUnitEnum } from '@cognite/sdk-wells-v3';

import { UserPreferredUnit } from 'constants/units';

export const adaptToConvertedDistance = (
  value: number,
  unit: DistanceUnitEnum | UserPreferredUnit | OtherConversionUnit
): ConvertedDistance => {
  let safeUnit;

  // get conversion using a custom unit name
  if (unit in OTHER_CONVERSION_UNITS) {
    safeUnit = OTHER_CONVERSION_UNITS[unit as OtherConversionUnit];
  } else {
    safeUnit = unit as Distance;
  }

  return { value, unit: safeUnit };
};
