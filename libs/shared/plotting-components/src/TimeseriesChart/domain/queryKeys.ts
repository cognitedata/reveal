import {
  TimeseriesDatapointsQuery,
  TimeseriesSingleAggregateQuery,
} from './service/types';

export const queryKeys = {
  timeseriesChart: ['timeseries', 'chart'] as const,

  timeseriesSingleAggregate: (query: TimeseriesSingleAggregateQuery) => [
    ...queryKeys.timeseriesChart,
    'timeseries',
    'aggregates',
    'single',
    query,
  ],

  datapoints: (query: TimeseriesDatapointsQuery) => [
    ...queryKeys.timeseriesChart,
    'datapoints',
    query,
  ],
};
