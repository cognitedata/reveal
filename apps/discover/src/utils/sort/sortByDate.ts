// Date columns in the table can use this to sort the date values

import isNumber from 'lodash/isNumber';

import { dateToEpoch, isValidDate } from '../date';
import { SHORT_DATE_FORMAT } from '../date/constants';

export const sortByDate = (
  val1?: Date | string | number,
  val2?: Date | string | number
): number => {
  if (val1 === undefined) return 0;
  if (val2 === undefined) return 0;
  if (!isValidDate(val1) && !isValidDate(val2)) return 0;
  if (!isValidDate(val1)) return -1;
  if (!isValidDate(val2)) return 1;

  if (isNumber(val1) && isNumber(val2)) {
    return val1 - val2;
  }

  if (isNumber(val1) || isNumber(val2)) {
    console.error('Invalid comparison', { val1, val2 });
    return 0;
  }

  return (
    dateToEpoch(val1, SHORT_DATE_FORMAT) - dateToEpoch(val2, SHORT_DATE_FORMAT)
  );
};
