/*!
 * Copyright 2024 Cognite AS
 */
import { type IdEither } from '@cognite/sdk';

export const queryKeys = {
  all: ['cdf'] as const,
  // ASSETS
  assetsById: (ids: IdEither[]) => [...assets, ids] as const,
  // Points of interest
  poiCommentsById: (id: any) => [...pois, id] as const,
  // TIMESERIES
  timeseriesById: (ids: IdEither[]) => [...timeseries, ids] as const,
  timeseriesLatestDatapoint: () => [...timeseries, 'latest-datapoints'] as const,
  // TIMESERIES RELATIONSHIPS WITH ASSETS
  timeseriesLinkedToAssets: () => [...timeseries, 'timeseries-linked-assets'] as const,
  timeseriesFromRelationship: () => [...timeseries, 'timeseries-relationship'] as const
} as const;

const assets: string[] = [...queryKeys.all, 'assets'];

const pois: string[] = [...queryKeys.all, 'pois'];
const timeseries: string[] = [...queryKeys.all, 'timeseries'];
