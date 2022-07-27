// DATE FORMATS

import isDate from 'lodash/isDate';
import isNumber from 'lodash/isNumber';
import isString from 'lodash/isString';
import moment, { MomentFormatSpecification, MomentInput } from 'moment';

export const SHORT_DATE_FORMAT = 'DD-MMM-YYYY';
export const LONG_DATE_FORMAT = 'DD MMMM, YYYY';
export const TIME_AND_DATE_FORMAT = 'DD-MMM-YY hh:mm:ss';
export const DOCUMENT_DATE_FORMAT = 'YYYY-MM-DDTHH:mm:ssZ';
export const CHART_AXIS_LABEL_DATE_FORMAT = 'MMM YYYY';
export const DATE_NOT_AVAILABLE = 'N/A';

export type DateFormat =
  | typeof SHORT_DATE_FORMAT
  | typeof LONG_DATE_FORMAT
  | typeof TIME_AND_DATE_FORMAT
  | typeof DOCUMENT_DATE_FORMAT
  | typeof CHART_AXIS_LABEL_DATE_FORMAT;

// NUMERIC TIME FORMATS
export const HOURS_IN_A_DAY = 24;
export const SECONDS_IN_MINUTE = 60;
export const MILLISECONDS_IN_SECOND = 1000;

export const adaptLocalEpochToUTC = (dateInEpoch: number) => {
  const offsetInMinutes = new Date().getTimezoneOffset();
  return (
    dateInEpoch - offsetInMinutes * SECONDS_IN_MINUTE * MILLISECONDS_IN_SECOND
  );
};

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

export const toDate = (
  date: MomentInput,
  currentFormat?: MomentFormatSpecification
): Date => moment(date, currentFormat).toDate();

export const formatDate = (
  date: MomentInput,
  targetFormat: DateFormat,
  currentFormat?: MomentFormatSpecification
): string => moment(date, currentFormat).format(targetFormat);
