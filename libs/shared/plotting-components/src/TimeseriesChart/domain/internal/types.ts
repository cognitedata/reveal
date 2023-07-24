import { DataFetchMode, DateRange, TimeseriesItem } from '../../types';

export interface TimeseriesChartQuery {
  timeseries: TimeseriesItem;
  dateRange?: DateRange;
  numberOfPoints?: number;
}

export interface TimeseriesChartMetadata {
  numberOfPoints: number;
  dataFetchMode: DataFetchMode;
  isStep?: boolean;
  isString?: boolean;
  unit?: string;
}
