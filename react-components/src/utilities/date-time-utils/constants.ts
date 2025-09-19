import relativeTime from 'dayjs/plugin/relativeTime';

type RelativeTimeOption = Parameters<typeof relativeTime>[0];
// Relative time content guidelines: https://zeroheight.com/37d494d9d/p/287f64-date-and-time/b/70f8ef/t/page-287f64-75881737-70f8ef-16
export const RELATIVE_TIME_CONFIG: RelativeTimeOption = {
  thresholds: [
    { l: 's', r: 59, d: 'second' },
    { l: 'm', r: 1 },
    { l: 'mm', r: 59, d: 'minute' },
    { l: 'h', r: 1 },
    { l: 'hh', r: 23, d: 'hour' },
    { l: 'd', r: 1 },
    { l: 'dd', r: 29, d: 'day' },
    { l: 'M', r: 1 },
    { l: 'MM', r: 11, d: 'month' },
    { l: 'y', r: 1 },
    { l: 'yy', d: 'year' },
  ],
};

export const DEFAULT_DATE_TIME_FORMAT = 'll LT';
export const DEFAULT_DATE_FORMAT = 'll';
export const DEFAULT_TIME_FORMAT = 'LT';
