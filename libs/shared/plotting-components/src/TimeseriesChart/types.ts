import { Timestamp } from '@cognite/sdk';
import { Style } from '../LineChart';

export interface TimeseriesChartProps {
  timeseriesId: number;
  dateRange?: [Date, Date];
  style?: Style;
}

export type TimeseriesQuery = {
  timeseriesId: number;
  start?: string | Timestamp;
  end?: string | Timestamp;
  granularity?: string;
  limit?: number;
};

export type TimePeriodType = 'Y' | 'M' | 'W' | 'D' | 'H' | 'Min';
export type TimePeriod = `${number}${TimePeriodType}`;
