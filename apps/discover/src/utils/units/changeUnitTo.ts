import convert from 'convert-units';
import get from 'lodash/get';
import { log } from 'utils/log';

import { UNITS_TO_STANDARD } from './constants';

export const changeUnitTo = (
  value: number,
  fromUnit: string,
  toUnit: string
) => {
  const standardFromUnit = get(UNITS_TO_STANDARD, fromUnit || '');
  let convertedValue;
  try {
    convertedValue = convert(Number(value))
      .from(standardFromUnit || fromUnit)
      .to(toUnit as any);
  } catch (e) {
    log(String(e));
  }
  return convertedValue;
};
