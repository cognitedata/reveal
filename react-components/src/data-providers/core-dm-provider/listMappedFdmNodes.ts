/*!
 * Copyright 2024 Cognite AS
 */
import {
  type DmsUniqueIdentifier,
  type FdmSDK,
  type InstanceFilter,
  makeSureNonEmptyFilterForRequest,
  type NodeItem,
  type Source
} from '../FdmSDK';
import { COGNITE_CAD_NODE_SOURCE, type COGNITE_ASSET_SOURCE, type CogniteAssetProperties } from './dataModels';
import { cadAssetQueryPayload, image360AssetsQueryPayload, pointCloudsAssetsQueryPayload } from './cadAndPointCloudAndImage360AssetQuery';
import { uniqBy } from 'lodash';

export async function listAllMappedFdmNodes(
  revisionRefs: DmsUniqueIdentifier[],
  sourcesToSearch: Source[],
  instancesFilter: InstanceFilter | undefined,
  fdmSdk: FdmSDK
): Promise<NodeItem[]> {
  if (revisionRefs.length === 0) {
    return [];
  }

  const limit = 1000;
  const filter = makeSureNonEmptyFilterForRequest(instancesFilter);

  const cadAssets = await queryCadAssets(sourcesToSearch, revisionRefs, filter, fdmSdk, limit);
  const pointCloudsAssets = await queryPointCloudsAssets(sourcesToSearch, revisionRefs, filter, fdmSdk, limit);
  const image360Assets = await queryImage360Assets(sourcesToSearch, revisionRefs, fdmSdk, limit);

  const allAssets = cadAssets
    .concat(pointCloudsAssets)
    .concat(image360Assets);
  return allAssets;
}

export async function listMappedFdmNodes(
  revisionRefs: DmsUniqueIdentifier[],
  sourcesToSearch: Source[],
  instancesFilter: InstanceFilter | undefined,
  limit: number,
  fdmSdk: FdmSDK
): Promise<NodeItem[]> {
  if (revisionRefs.length === 0) {
    return [];
  }

  const filter = makeSureNonEmptyFilterForRequest(instancesFilter);

  const cadAssets = await queryCadAssets(sourcesToSearch, revisionRefs, filter, fdmSdk, limit);
  const pointCloudsAssets = await queryPointCloudsAssets(sourcesToSearch, revisionRefs, filter, fdmSdk, limit);
  const image360Assets = await queryImage360Assets(sourcesToSearch, revisionRefs, fdmSdk, limit);

  return cadAssets
    .concat(pointCloudsAssets)
    .concat(image360Assets);
}

export async function queryCadAssets(sourcesToSearch : Source[], revisionRefs: DmsUniqueIdentifier[], filter: InstanceFilter | undefined, fdmSdk: FdmSDK, limit: number) {
  const rawQueryCAD = cadAssetQueryPayload(
    sourcesToSearch,
    filter,
    limit
  );

  const queryCAD = {
    ...rawQueryCAD,
    parameters: { revisionRefs }
  };

  const queryResultCAD = await fdmSdk.queryAllNodesAndEdges<
    typeof queryCAD,
    [{ source: typeof COGNITE_ASSET_SOURCE; properties: CogniteAssetProperties }]
  >(queryCAD, ['cad_nodes']);

  const filteredCadAssets = filterCadAssetsBasedOnObject3DFromCadNodes(sourcesToSearch, queryResultCAD.items.cad_assets, queryResultCAD.items.cad_nodes);

  return filteredCadAssets;
}

export async function queryPointCloudsAssets(sourcesToSearch : Source[], revisionRefs: DmsUniqueIdentifier[], filter: InstanceFilter | undefined, fdmSdk: FdmSDK, limit: number) {
  const rawQueryPointClouds = pointCloudsAssetsQueryPayload(
    sourcesToSearch,
    filter,
    limit
  )

  const queryPointClouds = {
    ...rawQueryPointClouds,
    parameters: { revisionRefs }
  };

  const queryResultPointClouds = await fdmSdk.queryAllNodesAndEdges<
    typeof queryPointClouds,
    [{ source: typeof COGNITE_ASSET_SOURCE; properties: CogniteAssetProperties }]
  >(queryPointClouds, ['pointcloud_volumes']);

  return queryResultPointClouds.items.pointcloud_assets;
}

export async function queryImage360Assets(sourcesToSearch : Source[], revisionRefs: DmsUniqueIdentifier[], fdmSdk: FdmSDK, limit: number) {
  const rawQueryImage360 = image360AssetsQueryPayload(
    sourcesToSearch,
    revisionRefs,
    limit
  );

  const queryImage360 = {
    ...rawQueryImage360,
    parameters: { revisionRefs }
  };

  const queryResultImage360 = await fdmSdk.queryAllNodesAndEdges<
    typeof queryImage360,
    [{ source: typeof COGNITE_ASSET_SOURCE; properties: CogniteAssetProperties }]
  >(queryImage360, ['image360_collections']);

  return queryResultImage360.items.image360_assets;
}

export function filterCadAssetsBasedOnObject3DFromCadNodes(
  sourcesToSearch: Source[],
  assets: NodeItem[],
  cadNodes: NodeItem[],
): NodeItem[] {
  const filteredAssets: NodeItem[] = [];

  cadNodes.forEach((cadNode) => {
    const cadNodeProperty = cadNode.properties[COGNITE_CAD_NODE_SOURCE.space][`${COGNITE_CAD_NODE_SOURCE.externalId}/${COGNITE_CAD_NODE_SOURCE.version}`];
    const cadNodeObject3D = cadNodeProperty?.object3D as DmsUniqueIdentifier;

    assets.forEach((asset) => {
      sourcesToSearch.forEach((source) => {

        const sourceProperty = asset.properties[source.space][`${source.externalId}/${source.version}`];
        const assetObject3D = sourceProperty?.object3D as DmsUniqueIdentifier;

        if (cadNodeObject3D && assetObject3D && cadNodeObject3D.externalId === assetObject3D.externalId && cadNodeObject3D.space === assetObject3D.space) {
          filteredAssets.push(asset);
        }
      });
    });
  });

  const uniqAssets = uniqBy(filteredAssets, (asset) => `${asset.space}-${asset.externalId}` );
  return uniqAssets;
}