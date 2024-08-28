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
import { type QueryRequest } from '@cognite/sdk';
import {
  COGNITE_ASSET_SOURCE,
  COGNITE_CAD_NODE_SOURCE,
  COGNITE_POINT_CLOUD_VOLUME_SOURCE,
  type CogniteAssetProperties,
  CORE_DM_3D_CONTAINER_SPACE
} from './dataModels';
import { cogniteAssetSourceWithProperties } from './cogniteAssetSourceWithProperties';

export async function listAllMappedFdmNodes(
  revisionRefs: DmsUniqueIdentifier[],
  sourcesToSearch: Source[],
  instancesFilter: InstanceFilter | undefined,
  fdmSdk: FdmSDK
): Promise<NodeItem[]> {
  const filter = makeSureNonEmptyFilterForRequest(instancesFilter);

  const rawQuery = createRawQuery(sourcesToSearch, filter, 10000);

  const query = {
    ...rawQuery,
    parameters: { revisionRefs }
  };

  const queryResult = await fdmSdk.queryAllNodesAndEdges<
    typeof query,
    [{ source: typeof COGNITE_ASSET_SOURCE; properties: CogniteAssetProperties }]
  >(query);

  return queryResult.items.cad_assets.concat(queryResult.items.pointcloud_assets);
}

export async function listMappedFdmNodes(
  revisionRefs: DmsUniqueIdentifier[],
  sourcesToSearch: Source[],
  instancesFilter: InstanceFilter | undefined,
  limit: number,
  fdmSdk: FdmSDK
): Promise<NodeItem[]> {
  const filter = makeSureNonEmptyFilterForRequest(instancesFilter);

  const rawQuery = createRawQuery(sourcesToSearch, filter, limit);

  const query = {
    ...rawQuery,
    parameters: { revisionRefs }
  };

  const queryResult = await fdmSdk.queryNodesAndEdges<
    typeof query,
    [{ source: typeof COGNITE_ASSET_SOURCE; properties: CogniteAssetProperties }]
  >(query);

  return queryResult.items.cad_assets.concat(queryResult.items.pointcloud_assets);
}

const containsRevisionFilter: InstanceFilter = {
  containsAny: {
    property: [CORE_DM_3D_CONTAINER_SPACE, COGNITE_CAD_NODE_SOURCE.externalId, 'revisions'],
    values: { parameter: 'revisionRefs' }
  }
} as const;

function createRawQuery(
  sourcesToSearch: Source[],
  filter: InstanceFilter | undefined,
  limit: number
): QueryRequest {
  // This return value throws away useful type information about the result, but I haven't found a way to
  // make the full type easily expressible
  return {
    with: {
      cad_nodes: {
        nodes: {
          filter: containsRevisionFilter
        },
        limit
      },
      cad_object_3d: {
        nodes: {
          from: 'cad_nodes',
          through: { view: COGNITE_CAD_NODE_SOURCE, identifier: 'object3D' },
          direction: 'outwards'
        }
      },
      cad_assets: {
        nodes: {
          from: 'cad_object_3d',
          through: { view: COGNITE_ASSET_SOURCE, identifier: 'object3D' },
          direction: 'inwards',
          filter
        }
      },
      pointcloud_volumes: {
        nodes: {
          filter: containsRevisionFilter
        },
        limit
      },
      pointcloud_object_3d: {
        nodes: {
          from: 'pointcloud_volumes',
          through: { view: COGNITE_POINT_CLOUD_VOLUME_SOURCE, identifier: 'object3D' },
          direction: 'outwards'
        }
      },
      pointcloud_assets: {
        nodes: {
          from: 'pointcloud_object_3d',
          through: { view: COGNITE_ASSET_SOURCE, identifier: 'object3D' },
          direction: 'inwards',
          filter
        }
      }
    },
    select: {
      cad_assets: {
        sources: [
          ...cogniteAssetSourceWithProperties,
          ...sourcesToSearch.map((source) => ({ source, properties: ['*'] }))
        ]
      },
      pointcloud_assets: {
        sources: cogniteAssetSourceWithProperties
      }
    }
  } as const satisfies Omit<QueryRequest, 'parameters' | 'cursors'>;
}
