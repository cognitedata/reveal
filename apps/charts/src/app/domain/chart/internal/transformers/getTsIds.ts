import { EMPTY_ARRAY } from '@charts-app/domain/constants';
import { Chart } from '@charts-app/models/chart/types';

export const getTsIds = (chart: Chart | undefined) =>
  chart?.timeSeriesCollection?.map((timeseries) => timeseries.tsId) ||
  EMPTY_ARRAY;
