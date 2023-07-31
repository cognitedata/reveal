import { format } from 'date-fns';

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000 - 1;
const UNIX_TIMESTAMP_FACTOR = 1000;
const TIMESTAMP_SECONDS_THRESHOLD = 9876543210;

export const msValue = (value: number) => {
  if (value < TIMESTAMP_SECONDS_THRESHOLD) {
    return value * UNIX_TIMESTAMP_FACTOR;
  }
  return value;
};

export const toRawDate = (date: Date, addDay = false) => {
  let value = date.getTime();
  if (addDay) {
    value += ONE_DAY_IN_MS;
  }
  return value;
};
export const toUnixDate = (value: number) => {
  return new Date(msValue(value));
};
export const toUnixLocalString = (value: number) => {
  return toUnixDate(msValue(value)).toLocaleString();
};

export const formatDate = (value: number, formatString = 'yyyy-MM-dd H:mm') => {
  return format(toUnixDate(msValue(value)), formatString);
};

export const TEN_MINUTES = 600000;
