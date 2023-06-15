import dayjs from 'dayjs';

export const getTimestamp = (date: Date) => {
  return dayjs(date).valueOf();
};
