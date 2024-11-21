/*!
 * Copyright 2024 Cognite AS
 */
import { type IdEither } from '@cognite/sdk';

export const queryKeys = {
  all: ['cdf'] as const,
  // ASSETS
  assetsById: (ids: IdEither[]) => [...assets, ids] as const,
  // Points of interest
  poiCommentsById: (id: unknown) => [...pois, id] as const,
  // TIMESERIES
  timeseriesById: (ids: IdEither[]) => [...timeseries, ids] as const,
  timeseriesLatestDatapoint: () => [...timeseries, 'latest-datapoints'] as const,
  // TIMESERIES RELATIONSHIPS WITH ASSETS
  timeseriesLinkedToAssets: () => [...timeseries, 'timeseries-linked-assets'] as const,
  // PointCloud Volume for CoreDM
  pointCloudDMVolumeMappings: () => [...models, 'point-cloud-dm-volume-mappings'] as const,
  pointCloudDMVolumeAssetMappings: () =>
    [...models, ...assets, 'point-cloud-dm-volume-asset-mappings'] as const,
  pointCloudDMVolumeSearch: () =>
    [...query, ...views, ...instancesFilter, limit, 'point-cloud-dm-volume-search'] as const,
  modelRevisionId: () => [...revisions, 'model-revision-id'] as const,
  timeseriesFromRelationship: () => [...timeseries, 'timeseries-relationship'] as const
} as const;

const assets: string[] = [...queryKeys.all, 'assets'];

const pois: string[] = [...queryKeys.all, 'pois'];
const timeseries: string[] = [...queryKeys.all, 'timeseries'];
const models: string[] = [...queryKeys.all, 'models'];
const revisions: string[] = [...queryKeys.all, 'revisions'];
const query: string[] = [...queryKeys.all, 'query'];
const views: string[] = [...queryKeys.all, 'views'];
const instancesFilter: string[] = [...queryKeys.all, 'instances-filter'];
const limit: string[] = [...queryKeys.all, 'limit'];
