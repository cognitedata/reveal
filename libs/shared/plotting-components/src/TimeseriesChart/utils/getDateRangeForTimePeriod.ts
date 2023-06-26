import dayjs, { ManipulateType, OpUnitType } from 'dayjs';

import { DateRange, TimePeriod, TimePeriodType } from '../types';

import { getTimePeriodData } from './getTimePeriodData';

const TIME_PERIOD_TYPE_MAP: Record<TimePeriodType, ManipulateType> = {
  Y: 'years',
  M: 'months',
  W: 'weeks',
  D: 'days',
  H: 'hours',
  Min: 'minutes',
};

const TIME_PERIOD_TRANSLATION_KEY_MAP: Record<TimePeriodType, string> = {
  Y: 'TIME_PERIOD_YEARS',
  M: 'TIME_PERIOD_MONTHS',
  W: 'TIME_PERIOD_WEEKS',
  D: 'TIME_PERIOD_DAYS',
  H: 'TIME_PERIOD_HOURS',
  Min: 'TIME_PERIOD_MINUTES',
};

export const getDateRangeForTimePeriod = (
  timePeriod: TimePeriod
): DateRange => {
  const { time, period } = getTimePeriodData(timePeriod);
  const dateRangeUnit = getDateRangeUnit(period);

  const start = dayjs()
    .startOf(dateRangeUnit)
    .subtract(time, TIME_PERIOD_TYPE_MAP[period])
    .toDate();

  const end = dayjs().startOf(dateRangeUnit).toDate();

  return [start, end];
};

export const getDateRangeUnit = (period: TimePeriodType): OpUnitType => {
  if (period === 'H' || period === 'Min') {
    return 'minute';
  }
  return 'day';
};

export const getTimePeriodTranslationKey = (period: TimePeriodType) => {
  return TIME_PERIOD_TRANSLATION_KEY_MAP[period];
};
