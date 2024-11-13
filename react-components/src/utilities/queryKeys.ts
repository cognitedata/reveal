/*!
 * Copyright 2024 Cognite AS
 */
import { type IdEither } from '@cognite/sdk';

export const queryKeys = {
  all: ['cdf'] as const,
  // ASSETS
  assetsById: (ids: IdEither[]) => [...assets, ids] as const,
  // TIMESERIES
  timeseriesById: (ids: IdEither[]) => [...timeseries, ids] as const,
  timeseriesLatestDatapoint: () => [...timeseries, 'latest-datapoints'] as const,
  // TIMESERIES RELATIONSHIPS WITH ASSETS
  timeseriesLinkedToAssets: () => [...timeseries, 'timeseries-linked-assets'] as const,
  // PointCloud Volume for CoreDM
  pointCloudDMVolume: () => [...models, 'point-cloud-dm-volume'] as const,
  modelRevisionId: () => [...revisions, 'model-revision-id'] as const
} as const;

const assets: string[] = [...queryKeys.all, 'assets'];

const timeseries: string[] = [...queryKeys.all, 'timeseries'];
const models: string[] = [...queryKeys.all, 'models'];
const revisions: string[] = [...queryKeys.all, 'revisions'];
