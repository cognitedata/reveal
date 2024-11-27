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
  // Point Cloud Annotations
  pointCloudAnnotationMappings: () => [...models, 'point-cloud-annotation-mappings'] as const,
  pointCloudAnnotationForAssetIds: () =>
    [...models, ...assets, 'point-cloud-all-annotations'] as const,
  pointCloudAnnotationForAssetId: () =>
    [...models, ...assets, 'asset-annotation-mapping-for-a-model'] as const,
  // PointCloud Volume for CoreDM
  pointCloudDMVolumeMappings: () => [...models, 'point-cloud-dm-volume-mappings'] as const,
  pointCloudDMVolumeAssetMappings: () =>
    [...models, ...assetInstanceRefs, 'point-cloud-dm-volume-asset-mappings'] as const,
  pointCloudDMModelIdRevisionIds: () =>
    [...models, 'point-cloud-dm-model-id-revision-ids'] as const,
  modelRevisionId: () => [...revisions, 'model-revision-id'] as const,
  timeseriesFromRelationship: () => [...timeseries, 'timeseries-relationship'] as const
} as const;

const assets: string[] = [...queryKeys.all, 'assets'];
const assetInstanceRefs: string[] = [...queryKeys.all, 'asset-instance-refs'];

const pois: string[] = [...queryKeys.all, 'pois'];
const timeseries: string[] = [...queryKeys.all, 'timeseries'];
const models: string[] = [...queryKeys.all, 'models'];
const revisions: string[] = [...queryKeys.all, 'revisions'];
