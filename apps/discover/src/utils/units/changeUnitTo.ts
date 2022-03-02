import convert from 'convert-units';
import get from 'lodash/get';
import { log } from 'utils/log';

import {
  OTHER_CONVERSION_UNITS,
  UNITS_TO_STANDARD,
  OtherConversionUnit,
} from './constants';

export const changeUnitTo = (
  value: number,
  fromUnit: convert.Unit | OtherConversionUnit,
  toUnit: convert.Unit
) => {
  let safeFrom;

  // get conversion using a custom unit name
  if (fromUnit in OTHER_CONVERSION_UNITS) {
    safeFrom = OTHER_CONVERSION_UNITS[fromUnit as OtherConversionUnit];
  } else {
    safeFrom = fromUnit as convert.Unit;
  }

  try {
    return convert(Number(value)).from(safeFrom).to(toUnit);
  } catch (error) {
    log(String(error));
    return value;
  }
};

const POSSIBLE_DISTANCE_UNITS = [
  'mm',
  'cm',
  'm',
  'km',
  'in',
  'ft-us',
  'ft',
  'mi',
];
/**
 * This is unsafe because the units are not typed
 * Prefer to use the changeUnitTo instead
 *
 * */
export const unsafeChangeUnitTo = (
  value: number,
  fromUnit: string,
  toUnit: string
) => {
  if (!POSSIBLE_DISTANCE_UNITS.includes(fromUnit)) {
    return value;
  }

  const standardFromUnit = get(UNITS_TO_STANDARD, fromUnit || '');

  return changeUnitTo(value, standardFromUnit, toUnit as convert.Unit);
};
