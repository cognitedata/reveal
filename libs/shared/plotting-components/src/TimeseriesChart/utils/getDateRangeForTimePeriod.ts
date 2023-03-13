import dayjs, { ManipulateType } from 'dayjs';

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

  const end = dayjs().toDate();

  const start = dayjs(end)
    .subtract(time, TIME_PERIOD_TYPE_MAP[period])
    .toDate();

  return [start, end];
};
