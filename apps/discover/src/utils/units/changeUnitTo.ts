import convert from 'convert-units';
import get from 'lodash/get';
import { Fixed, toFixedNumberFromNumber } from 'utils/number';

import { UNITS_TO_STANDARD, OtherConversionUnit } from './constants';
import { getSafeUnit } from './getSafeUnit';

export const changeUnitTo = (
  value: number,
  fromUnit: convert.Unit | OtherConversionUnit,
  toUnit: convert.Unit,
  toFixed = Fixed.ThreeDecimals
) => {
  const safeFrom = getSafeUnit(fromUnit);

  try {
    const convertedValue = convert(Number(value)).from(safeFrom).to(toUnit);
    return toFixedNumberFromNumber(convertedValue, toFixed);
  } catch (error) {
    // console.log('Unit conversion error:', error);
    return undefined;
  }
};

/**
 * @deprecated - use changeUnitTo
 * This is unsafe because the units are not typed
 * Prefer to use the changeUnitTo instead
 */
export const unsafeChangeUnitTo = (
  value: number,
  fromUnit: string,
  toUnit: string
) => {
  const standardFromUnit = get(UNITS_TO_STANDARD, fromUnit || '');
  return changeUnitTo(value, standardFromUnit, toUnit as convert.Unit);
};
