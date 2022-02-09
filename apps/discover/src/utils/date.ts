import isDate from 'lodash/isDate';
import isString from 'lodash/isString';
import moment, {
  Moment,
  MomentFormatSpecification,
  MomentInput,
  unitOfTime,
} from 'moment';

//
// this should be the only file that imports moment
//

// DATE FORMATS
export const SHORT_DATE_FORMAT = 'DD.MMM.YYYY';
export const LONG_DATE_FORMAT = 'DD MMMM, YYYY';
export const TIME_AND_DATE_FORMAT = 'DD.MMM.YY hh:mm:ss';
export const DOCUMENT_DATE_FORMAT = 'YYYY-MM-DDTHH:mm:ssZ';
export const CHART_AXIS_LABEL_DATE_FORMAT = 'MMM YYYY';
export const DATE_NOT_AVAILABLE = 'N/A';

// NUMERIC TIME FORMATS
export const HOURS_IN_A_DAY = 24;
export const SECONDS_IN_MINUTE = 60;
export const MILLISECONDS_IN_SECOND = 1000;

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

/**
 * @deprecated The method should not be used, use getDateOrDefaultText instead
 */
export const longDate = (
  date?: MomentInput,
  currentFormat?: MomentFormatSpecification
): string => formatDate(date || now(), LONG_DATE_FORMAT, currentFormat);

export const getYearFromNumber = (date: string | number) => moment(date).year();

export const shortDateTime = (
  dateTime: string | Date,
  currentFormat?: MomentFormatSpecification
) => getDateAsMoment(dateTime, currentFormat).format(TIME_AND_DATE_FORMAT);

export const shortDateToDate = (shortDate: string): Date =>
  moment(shortDate, SHORT_DATE_FORMAT).toDate();

export const currentDate = (): Date => moment().toDate();

export const getDateOrDefaultText = (
  possibleDate?: string | Date,
  targetFormat: DateFormat = SHORT_DATE_FORMAT
) => {
  if (
    possibleDate === undefined ||
    possibleDate === '' ||
    !isValidDate(possibleDate)
  ) {
    return DATE_NOT_AVAILABLE;
  }

  return formatDate(possibleDate, targetFormat);
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

export type PossibleDateRangeDate = Moment | Date | null;

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

export const getDocumentFormatFromDate = (value?: Date) =>
  value ? moment(value).format(DOCUMENT_DATE_FORMAT) : '';

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
  date: Date | string,
  currentFormat?: string
): boolean => {
  let checkingDate;
  if (isString(date) && moment(date, currentFormat).isValid()) {
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

export const adaptLocalEpochToUTC = (dateInEpoch: number) => {
  const offsetInMinutes = new Date().getTimezoneOffset();
  return (
    dateInEpoch - offsetInMinutes * SECONDS_IN_MINUTE * MILLISECONDS_IN_SECOND
  );
};
