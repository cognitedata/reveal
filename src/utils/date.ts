import { Timestamp } from '@cognite/sdk';
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
