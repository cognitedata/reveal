import { format } from 'date-fns';

export const dateformat = (date: Date): string => {
  let dateString = `____-__-__ __:__`;
  try {
    dateString = format(date, 'yyyy-MM-dd HH:mm');
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Error occured parsing date', date);
  }
  return dateString;
};
