import { ERROR_INVALID_DATA } from 'constants/error';

import { toFixedNumberFromNumber } from './toFixedNumberFromNumber';

export const toFixedNumber = (
  value: string | number,
  decimalPlaces = 3
): string | number => {
  const number = Number(value);

  return Number.isNaN(number)
    ? ERROR_INVALID_DATA
    : toFixedNumberFromNumber(number, decimalPlaces);
};
