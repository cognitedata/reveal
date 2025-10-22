import { type IdEither } from '@cognite/sdk';
import { type DmsUniqueIdentifier } from '../data-providers';
import { type InstanceReference } from './instanceIds';
import { type CadModelOptions } from '../components';
import { type AllAssetFilterProps } from '../query/network/common/filters';

export const queryKeys = {
  all: ['cdf'] as const,
  all3DResources: (): readonly ["cdf", "all-3d-resources"] => [...queryKeys.all, 'all-3d-resources'] as const,
  // ASSETS
  assetsById: (ids: IdEither[]): readonly [...string[], IdEither[]] => [...assets, ids] as const,
  assetsByIdsWithFilter: (ids: IdEither[], filter: AllAssetFilterProps): readonly [...string[], IdEither[], AllAssetFilterProps] =>
    [...queryKeys.assetsById(ids), filter] as const,
  // DM nodes
  dmNodesById: (ids: DmsUniqueIdentifier[]): readonly [...string[], DmsUniqueIdentifier[]] => [...dm, ids] as const,
  // Points of interest
  poiCommentsById: (id: unknown): readonly [...string[], unknown] => [...pois, id] as const,
  // TIMESERIES
  timeseriesById: (ids: IdEither[]): readonly [...string[], IdEither[]] => [...timeseries, ids] as const,
  timeseriesLatestDatapoint: (): readonly [...string[], "latest-datapoints"] => [...timeseries, 'latest-datapoints'] as const,
  // TIMESERIES RELATIONSHIPS WITH ASSETS
  timeseriesLinkedToAssets: (): readonly [...string[], "timeseries-linked-assets"] => [...timeseries, 'timeseries-linked-assets'] as const,
  // ASSETS AND TIMESERIES LINKAGE DATA
  assetsAndTimeseriesLinkageData: (
    timeseriesExternalIds: string[],
    relationshipResourceTypes: string[],
    assetExternalIds: string[]
  ): readonly [...string[], "assets-and-timeseries-linkage-data", string[], string[], string[]] =>
    [
      ...timeseries,
      'assets-and-timeseries-linkage-data',
      timeseriesExternalIds,
      relationshipResourceTypes,
      assetExternalIds
    ] as const,
  // FDM CONNECTION WITH NODE BY DM IDS
  fdmConnectionWithNode: (dmIds: DmsUniqueIdentifier[], models: CadModelOptions[]): readonly ["fdm-connection-with-node", DmsUniqueIdentifier[], CadModelOptions[]] =>
    ['fdm-connection-with-node', dmIds, models] as const,
  // Point Cloud Annotations
  pointCloudAnnotationMappings: (modelKeys: string[]): readonly [...string[], "point-cloud-annotation-mappings", string[]] =>
    [...models, 'point-cloud-annotation-mappings', modelKeys] as const,
  pointCloudAnnotationForAssetInstances: (modelKeys: string[], assetIdKeys: string[]): readonly [...string[], "point-cloud-all-annotations", string[], string[]] =>
    [...models, ...assets, 'point-cloud-all-annotations', modelKeys, assetIdKeys] as const,
  pointCloudAnnotationForAssetId: (modelKey: string, assetId: string): readonly [...string[], "asset-annotation-mapping-for-a-model", string, string] =>
    [...models, ...assets, 'asset-annotation-mapping-for-a-model', modelKey, assetId] as const,
  // PointCloud Volume for CoreDM
  pointCloudDMVolumeMappings: (modelKeys: string[]): readonly [...string[], "point-cloud-dm-volume-mappings", string[]] =>
    [...models, 'point-cloud-dm-volume-mappings', modelKeys] as const,
  pointCloudDMVolumeAssetMappings: (modelKeys: string[], assetInstanceKeys: string[]): readonly [...string[], "point-cloud-dm-volume-asset-mappings", string[], string[]] =>
    [
      ...models,
      ...assetInstanceRefs,
      'point-cloud-dm-volume-asset-mappings',
      modelKeys,
      assetInstanceKeys
    ] as const,
  pointCloudDMModelIdRevisionIds: (modelKeys: string[]): readonly [...string[], "point-cloud-dm-model-id-revision-ids", string[]] =>
    [...models, 'point-cloud-dm-model-id-revision-ids', modelKeys] as const,
  pointCloudDMVolumeAssetMappingsWithViews: (assetRefKeys: string[]): readonly [...string[], "point-cloud-dm-volume-asset-mappings-with-views", string[]] =>
    [...assets, 'point-cloud-dm-volume-asset-mappings-with-views', assetRefKeys] as const,
  modelRevisionId: (revisionKeys: string[]): readonly [...string[], "model-revision-id", string[]] =>
    [...revisions, 'model-revision-id', revisionKeys] as const,
  timeseriesFromRelationship: (): readonly [...string[], "timeseries-relationship"] => [...timeseries, 'timeseries-relationship'] as const,
  modelsForAssetPerInstanceReference: (instance: InstanceReference | undefined): readonly ["react-components", "models-for-assets-per-instance-reference", InstanceReference | undefined] =>
    ['react-components', 'models-for-assets-per-instance-reference', instance] as const,
  hybridDmAssetMappingsForInstances: (modelKeys: string[], instances: DmsUniqueIdentifier[]): readonly ["react-components", "hybrid-dm-asset-mappings-for-instances", string[], DmsUniqueIdentifier[]] =>
    ['react-components', 'hybrid-dm-asset-mappings-for-instances', modelKeys, instances] as const
} as const;

const assets: string[] = [...queryKeys.all, 'assets'];
const dm: string[] = [...queryKeys.all, 'dm'];
const assetInstanceRefs: string[] = [...queryKeys.all, 'asset-instance-refs'];

const pois: string[] = [...queryKeys.all, 'pois'];
const timeseries: string[] = [...queryKeys.all, 'timeseries'];
const models: string[] = [...queryKeys.all, 'models'];
const revisions: string[] = [...queryKeys.all, 'revisions'];
