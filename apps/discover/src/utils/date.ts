import isDate from 'lodash/isDate';
import isNumber from 'lodash/isNumber';
import isString from 'lodash/isString';
import moment, {
  MomentFormatSpecification,
  MomentInput,
  unitOfTime,
} from 'moment';

import { adaptLocalEpochToUTC } from './date/adaptLocalEpochToUTC';
import {
  CHART_AXIS_LABEL_DATE_FORMAT,
  DATE_NOT_AVAILABLE,
  DOCUMENT_DATE_FORMAT,
  LONG_DATE_FORMAT,
  SHORT_DATE_FORMAT,
  TIME_AND_DATE_FORMAT,
} from './date/constants';

// #######
// #######
// #######
// this should be the only file that imports moment!
// this should be the only file that imports moment!
// this should be the only file that imports moment!
//
// AND everything in here is deprecated!
//
// #######
// #######
// #######

export type DateFormat =
  | typeof SHORT_DATE_FORMAT
  | typeof LONG_DATE_FORMAT
  | typeof TIME_AND_DATE_FORMAT
  | typeof DOCUMENT_DATE_FORMAT
  | typeof CHART_AXIS_LABEL_DATE_FORMAT;

const dateReg = /^\d{2}([./-])\d{2}\1\d{4}$/;

export const toDate = (
  date: MomentInput,
  currentFormat?: MomentFormatSpecification
): Date => moment(date, currentFormat).toDate();

export const formatDate = (
  date: MomentInput,
  targetFormat: DateFormat,
  currentFormat?: MomentFormatSpecification
): string => moment(date, currentFormat).format(targetFormat);

/**
 * @deprecated The method should not be used, use getDateOrDefaultText instead
 */
export const shortDate = (
  date?: MomentInput,
  currentFormat?: MomentFormatSpecification
): string => formatDate(date || now(), SHORT_DATE_FORMAT, currentFormat);

export const getYearFromNumber = (date: string | number) => moment(date).year();

export const shortDateTime = (
  dateTime: string | Date,
  currentFormat?: MomentFormatSpecification
) => getDateAsMoment(dateTime, currentFormat).format(TIME_AND_DATE_FORMAT);

export const shortDateToDate = (shortDate: string): Date =>
  moment(shortDate, SHORT_DATE_FORMAT).toDate();

export const currentDate = (): Date => moment().toDate();

export const getDateOrDefaultText = (
  possibleDate?: string | number | Date,
  targetFormat: DateFormat = SHORT_DATE_FORMAT,
  currentFormat?: MomentFormatSpecification
) => {
  if (
    possibleDate === undefined ||
    possibleDate === '' ||
    !isValidDate(possibleDate, currentFormat)
  ) {
    return DATE_NOT_AVAILABLE;
  }

  return formatDate(possibleDate, targetFormat, currentFormat);
};

export const now = () => moment.now();

export const toISOString = () => moment().toISOString();

export const fromNow = (date: string | number) => moment(date).fromNow();

// This shouldn't be a export method
// We don't want to expose moment objects outside of this service

const getDateAsMoment = (
  date: Date | number | string,
  format?: MomentFormatSpecification
) => moment(date, format);

export const getDateByMatchingRegex = (
  date: Date | number | string,
  matcher = dateReg
) => {
  if (isString(date) && date.match(matcher)) {
    return date;
  }
  return moment(date).format(SHORT_DATE_FORMAT);
};

/*
 * Moment to epoch - Convert moment into: 1586951847577
 * DO NOT call this from components directly since this is accesspting a moment object
 * Components shouldn't know about moment objects
 *
 */

const toEpoch = (time: Date) => {
  return isValidDate(time) ? time.getTime() : 0;
};

export const getYear = (date?: string) => moment(date).year();

export const startOf = (value: Date, unitOfTime: unitOfTime.StartOf) => {
  return moment(value).startOf(unitOfTime).toDate();
};

export const endOf = (value: Date, unitOfTime: unitOfTime.StartOf) => {
  return moment(value).endOf(unitOfTime).toDate();
};

export const subtract = (
  date: Date | number,
  amount?: number,
  unit?: unitOfTime.DurationConstructor
) => {
  return moment(date).subtract(amount, unit);
};

export const dateToEpoch = (
  date: Date | string,
  currentFormat?: MomentFormatSpecification
) => toEpoch(isString(date) ? toDate(date, currentFormat) : date);

export const isValidDate = (
  date?: Date | string | number,
  currentFormat?: MomentFormatSpecification
): boolean => {
  if (!date) {
    return false;
  }

  let checkingDate;

  if (
    (isString(date) || isNumber(date)) &&
    moment(date, currentFormat).isValid()
  ) {
    checkingDate = toDate(date, currentFormat);
  } else {
    checkingDate = date;
  }
  return isDate(checkingDate) && !!checkingDate.getTime();
};

export const getTimeDuration = (
  time: number,
  unit: unitOfTime.DurationConstructor = 'milliseconds'
) => {
  const duration = moment.duration(time, unit);
  const durationAsMilliseconds = moment.utc(duration.asMilliseconds());

  const years = Math.floor(duration.asYears());
  const months = Math.floor(duration.asMonths()) - 12 * years;
  const days = Math.floor(duration.asDays()) - 30 * months;

  const hours = durationAsMilliseconds.hours();
  const minutes = durationAsMilliseconds.minutes();
  const seconds = durationAsMilliseconds.seconds();

  let timeDuration = '';

  if (years) timeDuration += `${years}Y `;
  if (months) timeDuration += `${months}M `;
  if (days) timeDuration += `${days}d `;
  if (hours) timeDuration += `${hours}h `;
  if (minutes) timeDuration += `${minutes}m `;
  if (seconds) timeDuration += `${seconds}s `;

  return timeDuration.trim();
};

export const adaptLocalDateToISOString = (date: Date) => {
  return moment(adaptLocalEpochToUTC(dateToEpoch(date)))
    .toDate()
    .toISOString();
};

export const toISOStringDate = (input: string | Date): string => {
  let date;

  if (isString(input)) {
    date = new Date(input);
  } else if (input instanceof Date) {
    date = input;
  } else {
    throw new Error('Input is not convertable to Date');
  }

  return date.toISOString().split('T')[0];
};
