import { Data } from '../LineChart';

import { TimePeriod } from './types';

export const DEFAULT_NUMBER_OF_POINTS = 500;
export const DEFAULT_RAW_DATAPOINTS_LIMIT = 500;

export const AXIS_DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss.SSS';

export const EMPTY_DATA: Data = {
  x: [],
  y: [],
};

export const TIME_PERIOD_OPTIONS: TimePeriod[] = [
  '15Min',
  '1H',
  '6H',
  '12H',
  '1D',
  '1W',
  '1M',
  '1Y',
  '2Y',
  '5Y',
  '10Y',
];
