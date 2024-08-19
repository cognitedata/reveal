import {
  DmsUniqueIdentifier,
  FdmSDK,
  InstanceFilter,
  makeSureNonEmptyFilterForRequest,
  NodeItem,
  Source
} from '../FdmSDK';
import { QueryRequest } from '@cognite/sdk';
import {
  COGNITE_3D_OBJECT_SOURCE,
  COGNITE_ASSET_SOURCE,
  COGNITE_CAD_NODE_SOURCE,
  COGNITE_POINT_CLOUD_VOLUME_SOURCE,
  CogniteAssetProperties
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
    property: [COGNITE_CAD_NODE_SOURCE.space, COGNITE_CAD_NODE_SOURCE.externalId, 'revisions'],
    values: { parameter: 'revisionRefs' }
  }
} as const;

function createRawQuery(
  sourcesToSearch: Source[],
  filter: InstanceFilter | undefined,
  limit: number
) {
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
          through: { source: COGNITE_CAD_NODE_SOURCE, identifier: 'object3D' }
        }
      },
      cad_assets: {
        nodes: {
          from: 'cad_object_3d',
          through: { source: COGNITE_3D_OBJECT_SOURCE, identifier: 'asset' },
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
          through: { source: COGNITE_POINT_CLOUD_VOLUME_SOURCE, identifier: 'object3D' }
        }
      },
      pointcloud_assets: {
        nodes: {
          from: 'cad_object_3d',
          through: { source: COGNITE_3D_OBJECT_SOURCE, identifier: 'asset' },
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
