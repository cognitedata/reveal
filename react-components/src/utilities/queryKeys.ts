/*!
 * Copyright 2024 Cognite AS
 */
import { type IdEither } from '@cognite/sdk';
import { type DmsUniqueIdentifier } from '../data-providers';

export const queryKeys = {
  all: ['cdf'] as const,
  all3DResources: () => [...queryKeys.all, 'all-3d-resources'] as const,
  // ASSETS
  assetsById: (ids: IdEither[]) => [...assets, ids] as const,
  // DM nodes
  dmNodesById: (ids: DmsUniqueIdentifier[]) => [...dm, ids] as const,
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
  pointCloudDMVolumeAssetMappingsWithViews: (assetRefKeys: string[]) =>
    [...assets, 'point-cloud-dm-volume-asset-mappings-with-views', assetRefKeys] as const,
  modelRevisionId: (revisionKeys: string[]) =>
    [...revisions, 'model-revision-id', revisionKeys] as const,
  timeseriesFromRelationship: () => [...timeseries, 'timeseries-relationship'] as const,
  searchedMappedCoreAssetsForHybridMappings: (
    query: string,
    limit: number,
    assetIdentifiersKeys: string[],
    viewKeys: string[],
    models: string[]
  ) =>
    [
      'search-mapped-core-assets-for-hybrid-mappings',
      query,
      limit,
      assetIdentifiersKeys,
      viewKeys,
      models
    ] as const,
  allMappedCoreAssetsForHybridMappings: (
    assetsFromHybridMappingsKeys: string[],
    models: string[],
    limit: number
  ) =>
    [
      'all-mapped-core-assets-for-hybrid-mappings',
      assetsFromHybridMappingsKeys,
      models,
      limit
    ] as const,
  hybridAssetMappingsFromFdm: (hybridFdmAssetExternalIdsKeys: string[], modelKeys: string[]) =>
    ['hybrid-asset-mappings-from-fdm', hybridFdmAssetExternalIdsKeys, modelKeys] as const
} as const;

const assets: string[] = [...queryKeys.all, 'assets'];
const dm: string[] = [...queryKeys.all, 'dm'];
const assetInstanceRefs: string[] = [...queryKeys.all, 'asset-instance-refs'];

const pois: string[] = [...queryKeys.all, 'pois'];
const timeseries: string[] = [...queryKeys.all, 'timeseries'];
const models: string[] = [...queryKeys.all, 'models'];
const revisions: string[] = [...queryKeys.all, 'revisions'];
