import dayjs from 'dayjs';
import isLodashDate from 'lodash/isDate';

export const getTimestamp = (date: Date) => {
  return dayjs(date).valueOf();
};

export const getLocalDate = (value: Date | string) => {
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000);
};

export const isDate = (value: unknown): value is Date => {
  if (value instanceof Date) {
    return String(value) !== 'Invalid Date' && isLodashDate(new Date(value));
  }
  return isValidDateString(String(value)) || isValidFDMDate(String(value));
};

export const formatDate = (
  date: Date,
  format: string = 'DD/MM/YYYY, HH:mm'
) => {
  return dayjs(date).format(format);
};

export const isValidDateString = (input: string) => {
  const datePattern = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/;
  return datePattern.test(input);
};

export const isValidFDMDate = (input: string) => {
  const datePattern =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$/;
  return datePattern.test(input);
};
