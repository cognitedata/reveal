import { Timestamp } from '@cognite/sdk';
import { formatDuration, intervalToDuration } from 'date-fns';
import dayjs from 'dayjs';

/**
 * convert ms to display
 */
export default function convertMSToDisplay(milliseconds: number) {
  if (Number.isNaN(milliseconds)) return '';
  let hour: number;
  let minute: number;
  let seconds: number;

  seconds = Math.floor(milliseconds / 1000);

  minute = Math.floor(seconds / 60);
  seconds %= 60;

  hour = Math.floor(minute / 60);
  minute %= 60;

  const day = Math.floor(hour / 24);
  hour %= 24;

  // 1d 4h 3m 4s
  return `${day}d ${hour}h ${minute}m ${seconds}s`;
}

/**
 * Format Date
 * =========================
 * @param date
 * @returns a date string parsed in `MM.DD.YYYY HH:mm` format.
 */
export const formatDate = (date: Date | Timestamp | undefined) => {
  if (!date) return '';
  return dayjs(date).format('MM.DD.YYYY HH:mm');
};

/**
 * Converts a duration string like 10m/10h to seconds
 *
 * @param from
 * @returns a number for example if passed 10m, the output is 600
 */
export const getTimeFactor = (from: string) => {
  switch (from) {
    case 'minutes':
    case 'm':
      return 60;
    case 'h':
    case 'hours':
      return 3600;
  }
  return 1;
};

/**
 * Converts a duration of ms like 18000 to human readable like 18 seconds
 *
 * @param ms
 * @returns a string for example 10seconds, 58m
 */
export const customFormatDuration = ({
  start,
  end,
}: {
  start: number;
  end: number;
}) => {
  const durations = intervalToDuration({ start, end });

  return durationFormatter(formatDuration(durations));
};

export const durationFormatter = (date: string) => {
  return date
    .replace(/ less than a minute/i, ' < 1 min')
    .replace(/ minute[s]?/i, ' min')
    .replace(/ hour[s]?/i, ' hr')
    .replace(/ day[s]?/i, ' day')
    .replace(/ month[s]?/i, ' mo')
    .replace(/ year[s]?/i, ' yr')
    .replace(/about /i, '~')
    .replace(/almost /i, '~')
    .replace(/ over/i, ' >');
};
