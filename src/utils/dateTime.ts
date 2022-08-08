import { timeFormat } from 'd3-time-format';
import {
  timeSecond,
  timeMinute,
  timeHour,
  timeDay,
  timeMonth,
  timeWeek,
  timeYear,
} from 'd3-time';

export const formatDate = timeFormat('%b %d %Y, %H:%M');

export const datetimeMultiFormat = (date: Date) => {
  const formatMillisecond = timeFormat('.%L');
  const formatSecond = timeFormat(':%S');
  const formatMinute = timeFormat('%H:%M');
  const formatHour = timeFormat('%H:%M');
  const formatDay = timeFormat('%a %d');
  const formatWeek = timeFormat('%b %d');
  const formatMonth = timeFormat('%B');
  const formatYear = timeFormat('%Y');

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
