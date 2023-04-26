import { DataFetchMode, DateRange } from '../../types';

export interface TimeseriesChartQuery {
  timeseriesId: number;
  dateRange?: DateRange;
  numberOfPoints?: number;
}

export interface TimeseriesChartMetadata {
  numberOfPoints: number;
  dataFetchMode: DataFetchMode;
  isStep?: boolean;
  isString?: boolean;
}
