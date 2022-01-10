// Date columns in the table can use this to sort the date values
import { dateToEpoch, isValidDate, SHORT_DATE_FORMAT } from './date';

export const sortDates = (val1: Date | string, val2: Date | string): number => {
  if (!isValidDate(val1) && !isValidDate(val2)) return 0;
  if (!isValidDate(val1)) return -1;
  if (!isValidDate(val2)) return 1;
  return (
    dateToEpoch(val1, SHORT_DATE_FORMAT) - dateToEpoch(val2, SHORT_DATE_FORMAT)
  );
};
