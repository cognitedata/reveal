import { type IdEither } from '@cognite/sdk';
import { type DmsUniqueIdentifier } from '../data-providers';
import { type InstanceReference } from './instanceIds';
import { type CadModelOptions } from '../components';
import { type AllAssetFilterProps } from '../query/network/common/filters';
import type { QueryKey } from '@tanstack/react-query';

export const queryKeys = {
  all: ['cdf'] as const,
  all3DResources: (): QueryKey => [...queryKeys.all, 'all-3d-resources'] as const,
  // ASSETS
  assetsById: (ids: IdEither[]): QueryKey => [...assets, ids] as const,
  assetsByIdsWithFilter: (ids: IdEither[], filter: AllAssetFilterProps): QueryKey =>
    [...queryKeys.assetsById(ids), filter] as const,
  // DM nodes
  dmNodesById: (ids: DmsUniqueIdentifier[]): QueryKey => [...dm, ids] as const,
  // Points of interest
  poiCommentsById: (id: unknown): QueryKey => [...pois, id] as const,
  // TIMESERIES
  timeseriesById: (ids: IdEither[]): QueryKey => [...timeseries, ids] as const,
  timeseriesLatestDatapoint: (): QueryKey => [...timeseries, 'latest-datapoints'] as const,
  // TIMESERIES RELATIONSHIPS WITH ASSETS
  timeseriesLinkedToAssets: (): QueryKey => [...timeseries, 'timeseries-linked-assets'] as const,
  // ASSETS AND TIMESERIES LINKAGE DATA
  assetsAndTimeseriesLinkageData: (
    timeseriesExternalIds: string[],
    relationshipResourceTypes: string[],
    assetExternalIds: string[]
  ): QueryKey =>
    [
      ...timeseries,
      'assets-and-timeseries-linkage-data',
      timeseriesExternalIds,
      relationshipResourceTypes,
      assetExternalIds
    ] as const,
  // FDM CONNECTION WITH NODE BY DM IDS
  fdmConnectionWithNode: (dmIds: DmsUniqueIdentifier[], models: CadModelOptions[]): QueryKey =>
    ['fdm-connection-with-node', dmIds, models] as const,
  // Point Cloud Annotations
  pointCloudAnnotationMappings: (modelKeys: string[]): QueryKey =>
    [...models, 'point-cloud-annotation-mappings', modelKeys] as const,
  pointCloudAnnotationForAssetInstances: (modelKeys: string[], assetIdKeys: string[]): QueryKey =>
    [...models, ...assets, 'point-cloud-all-annotations', modelKeys, assetIdKeys] as const,
  pointCloudAnnotationForAssetId: (modelKey: string, assetId: string): QueryKey =>
    [...models, ...assets, 'asset-annotation-mapping-for-a-model', modelKey, assetId] as const,
  // PointCloud Volume for CoreDM
  pointCloudDMVolumeMappings: (modelKeys: string[]): QueryKey =>
    [...models, 'point-cloud-dm-volume-mappings', modelKeys] as const,
  pointCloudDMVolumeAssetMappings: (modelKeys: string[], assetInstanceKeys: string[]): QueryKey =>
    [
      ...models,
      ...assetInstanceRefs,
      'point-cloud-dm-volume-asset-mappings',
      modelKeys,
      assetInstanceKeys
    ] as const,
  pointCloudDMModelIdRevisionIds: (modelKeys: string[]): QueryKey =>
    [...models, 'point-cloud-dm-model-id-revision-ids', modelKeys] as const,
  pointCloudDMVolumeAssetMappingsWithViews: (assetRefKeys: string[]): QueryKey =>
    [...assets, 'point-cloud-dm-volume-asset-mappings-with-views', assetRefKeys] as const,
  modelRevisionId: (revisionKeys: string[]): QueryKey =>
    [...revisions, 'model-revision-id', revisionKeys] as const,
  timeseriesFromRelationship: (): QueryKey => [...timeseries, 'timeseries-relationship'] as const,
  modelsForAssetPerInstanceReference: (instance: InstanceReference | undefined): QueryKey =>
    ['react-components', 'models-for-assets-per-instance-reference', instance] as const,
  hybridDmAssetMappingsForInstances: (
    modelKeys: string[],
    instances: DmsUniqueIdentifier[]
  ): QueryKey =>
    ['react-components', 'hybrid-dm-asset-mappings-for-instances', modelKeys, instances] as const
} as const;

const assets: string[] = [...queryKeys.all, 'assets'];
const dm: string[] = [...queryKeys.all, 'dm'];
const assetInstanceRefs: string[] = [...queryKeys.all, 'asset-instance-refs'];

const pois: string[] = [...queryKeys.all, 'pois'];
const timeseries: string[] = [...queryKeys.all, 'timeseries'];
const models: string[] = [...queryKeys.all, 'models'];
const revisions: string[] = [...queryKeys.all, 'revisions'];
