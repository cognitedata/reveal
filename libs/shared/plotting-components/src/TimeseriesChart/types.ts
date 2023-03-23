import { Timestamp } from '@cognite/sdk';
import { Variant } from '../LineChart';

export interface TimeseriesChartProps {
  timeseriesId: number;
  variant?: Variant;
  numberOfPoints?: number;
  quickTimePeriodOptions?: TimePeriod[];
  dateRange?: DateRange;
  height?: number;
  onChangeTimePeriod?: (props: UpdateTimePeriodProps) => void;
  onChangeDateRange?: (dateRange: DateRange) => void;
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

export interface UpdateTimePeriodProps {
  timePeriod: TimePeriod;
  dateRange: DateRange;
}
