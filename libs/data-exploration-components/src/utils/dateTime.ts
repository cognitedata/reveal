import {
  timeSecond,
  timeMinute,
  timeHour,
  timeDay,
  timeMonth,
  timeWeek,
  timeYear,
} from 'd3-time';
import dayjs from 'dayjs';

export const formatDate = (date: Date) =>
  dayjs(date).format('MMMM DD YYYY HH:mm G[M]T(Z)');

export const datetimeMultiFormat = (date: Date) => {
  const formatMillisecond = (newDate: Date) => dayjs(newDate).format('.SSS');
  const formatSecond = (newDate: Date) => dayjs(newDate).format(':ss');
  const formatMinute = (newDate: Date) => dayjs(newDate).format('HH:mm');
  const formatHour = (newDate: Date) => dayjs(newDate).format('HH:mm');
  const formatDay = (newDate: Date) => dayjs(newDate).format('ddd DD');
  const formatWeek = (newDate: Date) => dayjs(newDate).format('MMM DD');
  const formatMonth = (newDate: Date) => dayjs(newDate).format('MMMM');
  const formatYear = (newDate: Date) => dayjs(newDate).format('YYYY');

  if (timeSecond(date) < date) {
    return formatMillisecond(date);
  }

  if (timeMinute(date) < date) {
    return formatSecond(date);
  }

  if (timeHour(date) < date) {
    return formatMinute(date);
  }

  if (timeDay(date) < date) {
    return formatHour(date);
  }

  if (timeMonth(date) < date) {
    if (timeWeek(date) < date) {
      return formatDay(date);
    }

    return formatWeek(date);
  }

  if (timeYear(date) < date) {
    return formatMonth(date);
  }

  return formatYear(date);
};
