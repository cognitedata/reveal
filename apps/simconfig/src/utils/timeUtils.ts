import {
  formatDuration,
  formatISO9075,
  intervalToDuration,
  parseISO,
} from 'date-fns';

export type DurationType = 'd' | 'h' | 'm' | 'w';

export const DurationKeyMap: Record<DurationType, string> = {
  m: 'minutes',
  h: 'hours',
  d: 'days',
  w: 'weeks',
} as const;

export const DurationFormatMap: Record<DurationType, string> = {
  m: '',
  h: 'p',
  d: 'Pp',
  w: 'EEE, P',
};

export type DateType = Date | number | string;

export function parseDate(date?: DateType, fallback?: Date) {
  if (date === undefined) {
    return fallback;
  }

  if (date instanceof Date) {
    return date;
  }

  if (typeof date === 'number') {
    return new Date(date);
  }

  try {
    if (+date === +(+date).toString()) {
      // Numeric timestamp
      return new Date(+date);
    }
    const parsedDate = parseISO(date);
    if (parsedDate instanceof Date) {
      return parsedDate;
    }
  } catch (e) {
    console.error('Failed to parse date', date, e);
  }

  return fallback;
}

export const isValidDuration = (duration: string): duration is DurationType =>
  duration in DurationKeyMap;

export const formatCalculationDate = (date?: DateType) => {
  const parsedDate = parseDate(date);
  return parsedDate ? formatISO9075(parsedDate) : 'n/a';
};

export const formatCalculationDuration = (start?: DateType, end?: DateType) =>
  start && end
    ? formatDuration(
        intervalToDuration({
          start: parseDate(start) ?? 0,
          end: parseDate(end) ?? 0,
        })
      ) || '-'
    : 'n/a';
