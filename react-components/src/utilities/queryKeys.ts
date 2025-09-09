import { type IdEither } from '@cognite/sdk';
import { type DmsUniqueIdentifier } from '../data-providers';
import { type InstanceReference } from './instanceIds';
import { type CadModelOptions } from '../components';

export const queryKeys = {
  all: ['cdf'] as const,
  all3DResources: () => [...queryKeys.all, 'all-3d-resources'] as const,
  // ASSETS
  assetsById: (ids: IdEither[]) => [...assets, ids] as const,
  allClassicAssets: () => [...assets, 'all-classic-assets'] as const,
  // DM nodes
  dmNodesById: (ids: DmsUniqueIdentifier[]) => [...dm, ids] as const,
  // Points of interest
  poiCommentsById: (id: unknown) => [...pois, id] as const,
  // TIMESERIES
  timeseriesById: (ids: IdEither[]) => [...timeseries, ids] as const,
  timeseriesLatestDatapoint: () => [...timeseries, 'latest-datapoints'] as const,
  // TIMESERIES RELATIONSHIPS WITH ASSETS
  timeseriesLinkedToAssets: () => [...timeseries, 'timeseries-linked-assets'] as const,
  // ASSETS AND TIMESERIES LINKAGE DATA
  assetsAndTimeseriesLinkageData: (
    timeseriesExternalIds: string[],
    relationshipResourceTypes: string[],
    assetExternalIds: string[]
  ) =>
    [
      ...timeseries,
      'assets-and-timeseries-linkage-data',
      timeseriesExternalIds,
      relationshipResourceTypes,
      assetExternalIds
    ] as const,
  // FDM CONNECTION WITH NODE BY DM IDS
  fdmConnectionWithNode: (dmIds: DmsUniqueIdentifier[], models: CadModelOptions[]) =>
    ['fdm-connection-with-node', dmIds, models] as const,
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
  modelsForAssetPerInstanceReference: (instance: InstanceReference | undefined) =>
    ['react-components', 'models-for-assets-per-instance-reference', instance] as const,
  hybridDmAssetMappingsForInstances: (modelKeys: string[], instances: DmsUniqueIdentifier[]) =>
    ['react-components', 'hybrid-dm-asset-mappings-for-instances', modelKeys, instances] as const
} as const;

const assets: string[] = [...queryKeys.all, 'assets'];
const dm: string[] = [...queryKeys.all, 'dm'];
const assetInstanceRefs: string[] = [...queryKeys.all, 'asset-instance-refs'];

const pois: string[] = [...queryKeys.all, 'pois'];
const timeseries: string[] = [...queryKeys.all, 'timeseries'];
const models: string[] = [...queryKeys.all, 'models'];
const revisions: string[] = [...queryKeys.all, 'revisions'];
