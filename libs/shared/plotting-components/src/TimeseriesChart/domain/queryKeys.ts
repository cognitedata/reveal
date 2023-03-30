import {
  DatapointAggregatesQuery,
  StringDatapointsQuery,
} from './service/types';

export const queryKeys = {
  timeseriesChart: ['timeseries', 'chart'] as const,

  datapointAggregates: (query: DatapointAggregatesQuery) => [
    ...queryKeys.timeseriesChart,
    'datapoints',
    'aggregates',
    query,
  ],

  stringDatapoints: (query: StringDatapointsQuery) => [
    ...queryKeys.timeseriesChart,
    'datapoints',
    'string',
    query,
  ],
};
