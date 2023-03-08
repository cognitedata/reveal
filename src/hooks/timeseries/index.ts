import { Timeseries, TimeseriesFilter } from '@cognite/sdk';

export type TSParams = {
  limit?: number;
  advancedFilter?: any;
  filter?: TimeseriesFilter;
};

export type RawTimeseries = Omit<
  Timeseries,
  'lastUpdatedTime' | 'createdTime'
> & {
  lastUpdatedTime: number;
  createdTime: number;
};

export const TS_BASE_QUERY_KEY = ['timeseries'];

export * from './update';
