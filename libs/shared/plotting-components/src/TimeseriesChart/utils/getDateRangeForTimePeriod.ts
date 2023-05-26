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
