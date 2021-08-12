import { UNIX_TIMESTAMP_FACTOR } from 'typings/interfaces';
import { format } from 'date-fns';

const endOfDay = 24 * 60 * 60 * 999;
export const toRawDate = (date: Date, addDay = false) => {
  let value = date.getTime();
  if (addDay) {
    value += endOfDay;
  }
  return value / UNIX_TIMESTAMP_FACTOR;
};
export const toUnixDate = (value: number) => {
  return new Date(value * UNIX_TIMESTAMP_FACTOR);
};
export const toUnixLocalString = (value: number) => {
  return toUnixDate(value).toLocaleString();
};

export const formatDate = (value: number, formatString = 'Pp') => {
  return format(toUnixDate(value), formatString);
};
