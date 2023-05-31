import { Style, Variant } from '../LineChart';

export interface TimeseriesChartProps {
  timeseriesId: number;
  variant?: Variant;
  numberOfPoints?: number;
  quickTimePeriodOptions?: TimePeriod[];
  dateRange?: DateRange;
  /**
   * If specified, the specified height will be applied.
   * If not specified and the chart component is wrapped, it will take the height of the wrapper.
   * Otherwise, it will be rendered in the default height. (Approx 500px)
   */
  height?: number;
  dataFetchOptions?: DataFetchOptions;
  autoRange?: boolean;
  onChangeTimePeriod?: (props: UpdateTimePeriodProps) => void;
  onChangeDateRange?: (dateRange: DateRange) => void;
  hideActions?: boolean;
  styles?: Style;
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
