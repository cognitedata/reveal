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
import { cadAndPointCloudAndImage36AssetQuery } from './cadAndPointCloudAndImage360AssetQuery';
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

  const filter = makeSureNonEmptyFilterForRequest(instancesFilter);

  const rawQuery = cadAndPointCloudAndImage36AssetQuery(
    sourcesToSearch,
    revisionRefs,
    filter,
    1000
  );

  const query = {
    ...rawQuery,
    parameters: { revisionRefs }
  };

  const initialCursorType = Object.keys(rawQuery.with)[0];
  const queryResult = await fdmSdk.queryAllNodesAndEdges<
    typeof query,
    [{ source: typeof COGNITE_ASSET_SOURCE; properties: CogniteAssetProperties }]
  >(query, initialCursorType);

  const filteredCadAssets = filterCadAssetsBasedOnObject3DFromCadNodes(sourcesToSearch, queryResult.items.cad_assets, queryResult.items.cad_nodes);
  const allAssets = filteredCadAssets.concat(queryResult.items.pointcloud_assets);
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

  const rawQuery = cadAndPointCloudAndImage36AssetQuery(
    sourcesToSearch,
    revisionRefs,
    filter,
    limit
  );

  const query = {
    ...rawQuery,
    parameters: { revisionRefs }
  };

  const queryResult = await fdmSdk.queryNodesAndEdges<
    typeof query,
    [{ source: typeof COGNITE_ASSET_SOURCE; properties: CogniteAssetProperties }]
  >(query);

  return queryResult.items.cad_assets
    .concat(queryResult.items.pointcloud_assets)
    .concat(queryResult.items.image360_assets);
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
