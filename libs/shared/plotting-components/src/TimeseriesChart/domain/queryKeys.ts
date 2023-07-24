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

  datapoints: (queries: TimeseriesDatapointsQuery[]) => [
    ...queryKeys.timeseriesChart,
    'datapoints',
    queries,
  ],
};
