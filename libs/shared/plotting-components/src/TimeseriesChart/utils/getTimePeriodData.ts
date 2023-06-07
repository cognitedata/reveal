import head from 'lodash/head';

import { TimePeriod, TimePeriodType } from '../types';

export const getTimePeriodData = (timePeriod: TimePeriod) => {
  const time = Number(head(timePeriod.match(/\d+/g)));
  const period = String(head(timePeriod.match(/[a-zA-Z]+/g))) as TimePeriodType;

  return { time, period };
};
