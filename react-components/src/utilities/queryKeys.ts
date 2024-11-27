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
  pointCloudAnnotationMappings: (modelKeys: string[]) =>
    [...models, 'point-cloud-annotation-mappings', modelKeys] as const,
  pointCloudAnnotationForAssetIds: (modelKeys: string[], assetIdKeys: string[]) =>
    [...models, ...assets, 'point-cloud-all-annotations', modelKeys, assetIdKeys] as const,
  pointCloudAnnotationForAssetId: (modelKey: string, assetId: string) =>
    [...models, ...assets, 'asset-annotation-mapping-for-a-model', modelKey, assetId] as const,
  // PointCloud Volume for CoreDM
  pointCloudDMVolumeMappings: (modelKeys: string[]) =>
    [...models, 'point-cloud-dm-volume-mappings', modelKeys] as const,
  pointCloudDMVolumeAssetMappings: (modelKeys: string[], assetInstanceKeys: string[]) =>
    [
      ...models,
      ...assetInstanceRefs,
      'point-cloud-dm-volume-asset-mappings',
      modelKeys,
      assetInstanceKeys
    ] as const,
  pointCloudDMModelIdRevisionIds: (modelKeys: string[]) =>
    [...models, 'point-cloud-dm-model-id-revision-ids', modelKeys] as const,
  modelRevisionId: (revisionKeys: string[]) =>
    [...revisions, 'model-revision-id', revisionKeys] as const,
  timeseriesFromRelationship: () => [...timeseries, 'timeseries-relationship'] as const
} as const;

const assets: string[] = [...queryKeys.all, 'assets'];
const assetInstanceRefs: string[] = [...queryKeys.all, 'asset-instance-refs'];

const pois: string[] = [...queryKeys.all, 'pois'];
const timeseries: string[] = [...queryKeys.all, 'timeseries'];
const models: string[] = [...queryKeys.all, 'models'];
const revisions: string[] = [...queryKeys.all, 'revisions'];
