import { Chart } from '@charts-app/models/chart/types';
import { EMPTY_ARRAY } from '@charts-app/domain/constants';

export const getTsIds = (chart: Chart | undefined) =>
  chart?.timeSeriesCollection?.map((timeseries) => timeseries.tsId) ||
  EMPTY_ARRAY;
