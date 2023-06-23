import { format } from 'date-fns';

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

  let seconds = diffInMilliSeconds / 1000;
  const hours = Math.floor(seconds / 3600); // 3600 seconds in 1 hour
  seconds %= 3600; // seconds remaining after extracting hours
  const minutes = Math.floor(seconds / 60); // 60 seconds in 1 minute
  seconds = Math.round(seconds % 60); // seconds remaining after extracting minutes

  return `${hours} h ${minutes} min ${seconds} sec`;
};
