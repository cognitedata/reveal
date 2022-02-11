import { format } from 'date-fns';
import moment from 'moment';

export const dateformat = (date: Date): string => {
  let dateString = `____-__-__ __:__`;
  try {
    dateString = format(date, 'yyyy-MM-dd HH:mm:ss');
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Error occured parsing date', date);
  }
  return dateString;
};

export const getDateDiff = (start: Date, end: Date): string => {
  const diffInMilliSeconds = end.getTime() - start.getTime();
  return moment.utc(diffInMilliSeconds).format('H [h] m [min] s [sec]');
};
