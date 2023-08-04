import dayjs from 'dayjs';
import isDateLodash from 'lodash/isDate';

export const getTimestamp = (date: Date) => {
  return dayjs(date).valueOf();
};

export const getLocalDate = (value: Date | string) => {
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000);
};

export const isDate = (value: unknown): value is Date => {
  return isDateLodash(value) && dayjs(value as Date).isValid();
};

export const formatDate = (
  date: Date,
  format: string = 'DD/MM/YYYY, HH:mm'
) => {
  return dayjs(date).format(format);
};
