import { CogniteEvent, Timeseries } from '@cognite/sdk';

export type RawTimeseries = Omit<
  Timeseries,
  'lastUpdatedTime' | 'createdTime'
> & {
  lastUpdatedTime: number;
  createdTime: number;
};

export type RawCogniteEvent = Omit<
  CogniteEvent,
  'lastUpdatedTime' | 'createdTime'
> & {
  lastUpdatedTime: number;
  createdTime: number;
};
