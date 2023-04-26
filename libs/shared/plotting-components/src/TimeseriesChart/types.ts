import { Variant } from '../LineChart';

export interface TimeseriesChartProps {
  timeseriesId: number;
  variant?: Variant;
  numberOfPoints?: number;
  isString?: boolean;
  quickTimePeriodOptions?: TimePeriod[];
  dateRange?: DateRange;
  height?: number;
  dataFetchOptions?: DataFetchOptions;
  onChangeTimePeriod?: (props: UpdateTimePeriodProps) => void;
  onChangeDateRange?: (dateRange: DateRange) => void;
}

export type DateRange = [Date, Date];

export type TimePeriodType = 'Y' | 'M' | 'W' | 'D' | 'H' | 'Min';
export type TimePeriod = `${number}${TimePeriodType}`;

export interface UpdateTimePeriodProps {
  timePeriod: TimePeriod;
  dateRange: DateRange;
}

export type DataFetchMode = 'raw' | 'aggregate';

export type DataFetchOptions =
  | {
      mode: DataFetchMode;
      rawDatapointsLimit?: never;
    }
  | {
      mode?: 'auto';
      rawDatapointsLimit: number;
    };
