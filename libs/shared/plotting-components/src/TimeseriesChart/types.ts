import { Timestamp } from '@cognite/sdk';

export interface TimeseriesChartProps {
  timeseriesId: number;
  quickTimePeriodOptions?: TimePeriod[];
  dateRange?: DateRange;
  onChangeDateRange?: (dateRange: DateRange) => void;
  height?: number;
}

export type DateRange = [Date, Date];

export type TimeseriesQuery = {
  timeseriesId: number;
  start?: string | Timestamp;
  end?: string | Timestamp;
  granularity?: string;
  limit?: number;
};

export type TimePeriodType = 'Y' | 'M' | 'W' | 'D' | 'H' | 'Min';
export type TimePeriod = `${number}${TimePeriodType}`;

export interface UpdateDateRangeProps {
  timePeriod: TimePeriod;
  dateRange: DateRange;
}
