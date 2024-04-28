/*!
 * Copyright 2024 Cognite AS
 */
import { type IdEither } from '@cognite/sdk/dist/src';

export const queryKeys = {
  all: ['cdf'] as const,
  // ASSETS
  assets: () => [...queryKeys.all, 'assets'] as const,
  assetsById: (ids: IdEither[]) => [...queryKeys.all, 'assets', ids] as const,
  // TIMESERIES
  timeseries: () => [...queryKeys.all, 'timeseries'] as const,
  timeseriesById: (ids: IdEither[]) => [...queryKeys.timeseries(), ids] as const,
  timeseriesLatestDatapoint: () => [...queryKeys.all, 'timeseries', 'latest-datapoints'] as const,
  // TIMESERIES RELATIONSHIPS WITH ASSETS
  timeseriesLinkedToAssets: () =>
    [...queryKeys.all, 'timeseries', 'timeseries-linked-assets'] as const
} as const;
