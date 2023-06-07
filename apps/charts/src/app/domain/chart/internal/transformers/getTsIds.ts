import { Chart } from 'models/chart/types';
import { EMPTY_ARRAY } from 'domain/constants';

export const getTsIds = (chart: Chart | undefined) =>
  chart?.timeSeriesCollection?.map((timeseries) => timeseries.tsId) ||
  EMPTY_ARRAY;
