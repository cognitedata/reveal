import dayjs from 'dayjs';

export const formatDateForFilterInput = (date: Date) => {
  return dayjs(date).format('YYYY-MM-DDTHH:mm');
};
