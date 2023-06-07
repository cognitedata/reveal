import dayjs from 'dayjs';

export const getFormattedDate = (date: Date) => {
  return dayjs(date).format('DD.MM.YYYY');
};
