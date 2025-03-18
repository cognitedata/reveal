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
import { type COGNITE_ASSET_SOURCE, type CogniteAssetProperties } from './dataModels';
import { cadAndPointCloudAndImage36AssetQuery } from './cadAndPointCloudAndImage360AssetQuery';
import { AllMappedInfiniteQueryCursorType } from './types';

export async function listAllMappedFdmNodes(
  revisionRefs: DmsUniqueIdentifier[],
  sourcesToSearch: Source[],
  instancesFilter: InstanceFilter | undefined,
  fdmSdk: FdmSDK,
  pageParam?: AllMappedInfiniteQueryCursorType
): Promise<{ items: NodeItem[], nextCursor: {} | undefined }> {
  if (revisionRefs.length === 0) {
    return {
      items: [],
      nextCursor: undefined
    };
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

  const queryResult = await fdmSdk.queryAllNodesAndEdges<
    typeof query,
    [{ source: typeof COGNITE_ASSET_SOURCE; properties: CogniteAssetProperties }]
  >(query);

  const items = queryResult.items.cad_assets.concat(queryResult.items.pointcloud_assets);
  return {
    items,
    nextCursor: queryResult.nextCursor
  }
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
