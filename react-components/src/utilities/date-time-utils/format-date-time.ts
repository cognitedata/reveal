import dayjs from 'dayjs';
import dayjsIsToday from 'dayjs/plugin/isToday';
import dayjsIsTomorrow from 'dayjs/plugin/isTomorrow';
import dayjsIsYesterday from 'dayjs/plugin/isYesterday';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';

import 'dayjs/locale/de';
import 'dayjs/locale/en';
import 'dayjs/locale/es';
import 'dayjs/locale/fr';
import 'dayjs/locale/it';
import 'dayjs/locale/lv';
import 'dayjs/locale/nl';
import 'dayjs/locale/pt';
import 'dayjs/locale/sv';
import 'dayjs/locale/ko';
import 'dayjs/locale/zh';
import 'dayjs/locale/ja';

import { DEFAULT_DATE_TIME_FORMAT, RELATIVE_TIME_CONFIG } from './constants';
import { DateTimeFormatArguments, DateTimeFormatOptions } from './types';

dayjs.extend(relativeTime, RELATIVE_TIME_CONFIG);
dayjs.extend(dayjsIsToday);
dayjs.extend(dayjsIsTomorrow);
dayjs.extend(dayjsIsYesterday);
dayjs.extend(localizedFormat);

/**
 * Formats a given date and time based on the provided options.
 *
 * @param options - The options for formatting the date and time.
 * @param options.date - The date to be formatted.
 * @param options.language - The language locale to be used for formatting.
 * @param options.showAbsolute - Whether to show the absolute date and time.
 * @param options.format - The format to be used for the absolute date and time.
 * @param options.thresholdInHours - The threshold in hours to determine if the date should be shown as relative or absolute.
 *
 * @returns The formatted date and time as a string.
 */
export const formatDateTime = (options: DateTimeFormatArguments) => {
  const { date, language, showAbsolute, format } = options;

  let dateInput = dayjs(date);

  if (language) {
    dateInput = dateInput.locale(language);
  }

  if (showAbsolute) {
    return getAbsoluteDateTime({ date: dateInput, format });
  }

  const isWithinThreshold =
    options.thresholdInHours && Number.isInteger(options.thresholdInHours)
      ? dateInput.isAfter(dayjs().subtract(options.thresholdInHours, 'hour')) &&
        dateInput.isBefore(dayjs().add(options.thresholdInHours, 'hour'))
      : dateInput.isAfter(dayjs().subtract(24, 'hour')) &&
        dateInput.isBefore(dayjs().add(24, 'hour'));

  if (isWithinThreshold) {
    return getRelativeDateTime({ date: dateInput });
  } else {
    return getAbsoluteDateTime({ date: dateInput, format });
  }
};

/**
 * Returns a relative time string (e.g., "a few seconds ago") based on the provided date and language options.
 *
 * @param options - An object containing the date and language options.
 * @param options.date - The date to be formatted.
 * @param options.language - (Optional) The language locale to use for formatting.
 *
 * @returns A string representing the relative time from the current date.
 */
export const getRelativeDateTime = (options: DateTimeFormatOptions) => {
  let dateInput = dayjs(options.date);

  if (options.language) {
    dateInput = dateInput.locale(options.language);
  }

  return dateInput.fromNow();
};

/**
 * Formats a given date into an absolute date-time string based on the provided options.
 *
 * @param options - An object containing the date, language, and format options.
 * @param options.date - The date to be formatted.
 * @param options.language - (Optional) The language locale to use for formatting.
 * @param options.format - (Optional) The format string to use for formatting the date.
 *
 * @returns A string representing the formatted date-time.
 */
export const getAbsoluteDateTime = (options: DateTimeFormatOptions) => {
  let dateInput = dayjs(options.date);

  if (options.language) {
    dateInput = dateInput.locale(options.language);
  }

  // default can change later.
  const format = options.format ?? DEFAULT_DATE_TIME_FORMAT;

  return dateInput.format(format);
};

export const isToday = (date: dayjs.ConfigType) => {
  return dayjs(date).isToday();
};

export const isTomorrow = (date: dayjs.ConfigType) => {
  return dayjs(date).isTomorrow();
};

export const isYesterday = (date: dayjs.ConfigType) => {
  return dayjs(date).isYesterday();
};
