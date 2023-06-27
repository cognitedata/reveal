import dayjs from 'dayjs';

export const getFormattedTime = (date: Date) => {
  return dayjs(date).format('HH:mm:ss');
};
