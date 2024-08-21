/*!
 * Copyright 2024 Cognite AS
 */
import { type InstancesWithView } from '../../query/useSearchMappedEquipmentFDM';
import {
  type QueryRequest,
  type QueryTableExpressionV3,
  type SourceSelectorV3
} from '@cognite/sdk/dist/src';
import { getDirectRelationProperties } from '../utils/getDirectRelationProperties';
import {
  type Cognite3DObjectProperties,
  COGNITE_3D_OBJECT_SOURCE,
  COGNITE_CAD_NODE_SOURCE,
  COGNITE_POINT_CLOUD_VOLUME_SOURCE,
  COGNITE_VISUALIZABLE_SOURCE
} from './dataModels';
import { type DmsUniqueIdentifier, type FdmSDK } from '../FdmSDK';
import { cogniteObject3dSourceWithProperties } from './cogniteObject3dSourceWithProperties';
import { type FdmKey } from '../../components/CacheProvider/types';
import { toFdmKey } from '../utils/toFdmKey';
import { type ArrayElement, type PromiseType } from '../utils/typeUtils';
import { head } from 'lodash';
import { type QueryResult } from '../utils/queryNodesAndEdges';

export async function filterNodesByMappedTo3d(
  nodes: InstancesWithView[],
  revisionRefs: DmsUniqueIdentifier[],
  _spacesToSearch: string[],
  fdmSdk: FdmSDK
): Promise<InstancesWithView[]> {
  const connectionData = await fetchConnectionData(nodes, revisionRefs, fdmSdk);

  const assetKeys: Set<FdmKey> = createRelevantAssetKeySet(connectionData);

  return nodes.map((viewWithNodes) => ({
    view: viewWithNodes.view,
    instances: viewWithNodes.instances.filter((instance) => assetKeys.has(toFdmKey(instance)))
  }));
}

function createRelevantAssetKeySet(
  connectionData: PromiseType<ReturnType<typeof fetchConnectionData>>
): Set<FdmKey> {
  const cadNodeSet = new Set<FdmKey>(
    new Array<DmsUniqueIdentifier>()
      .concat(connectionData.items.initial_nodes_cad_nodes)
      .concat(connectionData.items.direct_nodes_cad_nodes)
      .concat(connectionData.items.indirect_nodes_cad_nodes)
      .map(toFdmKey)
  );

  const pointCloudNodeSet = new Set<FdmKey>(
    new Array<DmsUniqueIdentifier>()
      .concat(connectionData.items.initial_nodes_point_cloud_volumes)
      .concat(connectionData.items.direct_nodes_point_cloud_volumes)
      .concat(connectionData.items.indirect_nodes_point_cloud_volumes)
      .map(toFdmKey)
  );

  const relevantObject3Ds = new Array<
    ArrayElement<typeof connectionData.items.initial_nodes_object_3ds>
  >()
    .concat(connectionData.items.initial_nodes_object_3ds)
    .concat(connectionData.items.direct_nodes_object_3ds)
    .concat(connectionData.items.indirect_nodes_object_3ds)
    .filter((object3d) => {
      const props = object3d.properties.cdf_cdm_experimental['CogniteObject3D/v1'];
      return (
        props.cadNodes.some((node) => cadNodeSet.has(toFdmKey(node))) ||
        props.pointCloudVolumes.some((node) => pointCloudNodeSet.has(toFdmKey(node)))
      );
    });

  const relevantAssetKeySet = relevantObject3Ds.reduce((acc, object3D) => {
    // Assume at most one connected asset
    const firstAsset = head(object3D.properties.cdf_cdm_experimental['CogniteObject3D/v1'].asset);
    if (firstAsset === undefined) {
      return acc;
    }
    acc.add(toFdmKey(firstAsset));
    return acc;
  }, new Set<FdmKey>());

  // Append relevant edge start nodes directly to previous set
  connectionData.items.indirectly_referenced_edges.reduce((acc, edge) => {
    if (relevantAssetKeySet.has(toFdmKey(edge.endNode))) {
      acc.add(toFdmKey(edge.startNode));
    }

    return acc;
  }, relevantAssetKeySet);

  return relevantAssetKeySet;
}

type SelectSourcesType = [
  { source: typeof COGNITE_3D_OBJECT_SOURCE; properties: Cognite3DObjectProperties },
  { source: typeof COGNITE_CAD_NODE_SOURCE; properties: { object3D: DmsUniqueIdentifier } },
  {
    source: typeof COGNITE_POINT_CLOUD_VOLUME_SOURCE;
    properties: { object3D: DmsUniqueIdentifier };
  }
];

async function fetchConnectionData(
  nodes: InstancesWithView[],
  revisionRefs: DmsUniqueIdentifier[],
  fdmSdk: FdmSDK
): Promise<QueryResult<typeof checkEquipmentFilter, SelectSourcesType>> {
  const initialExternalIds = nodes.flatMap((node) =>
    node.instances.map((instance) => instance.externalId)
  );

  const directlyMappedIds = nodes.flatMap((node) =>
    node.instances.map(getDirectRelationProperties)
  );

  const parameters = { initialExternalIds, directlyMappedIds, revisionRefs };

  const query = {
    ...checkEquipmentFilter,
    parameters
  };

  return await fdmSdk.queryAllNodesAndEdges<typeof query, SelectSourcesType>(query);
}

const pointCloudVolumeSourceWithProperties = [
  {
    source: COGNITE_POINT_CLOUD_VOLUME_SOURCE,
    properties: ['object3D']
  }
] as const satisfies SourceSelectorV3;

const cadNodeSourceWithProperties = [
  {
    source: COGNITE_CAD_NODE_SOURCE,
    properties: ['object3D']
  }
] as const satisfies SourceSelectorV3;

const checkEquipmentFilter = {
  with: {
    initial_nodes: {
      nodes: {
        filter: {
          and: [
            {
              in: {
                property: ['node', 'externalId'],
                values: { parameter: 'initialExternalIds' }
              }
            },
            {
              hasData: [COGNITE_VISUALIZABLE_SOURCE]
            }
          ]
        }
      }
    },
    directly_referenced_nodes: {
      nodes: {
        filter: {
          and: [
            {
              in: {
                property: ['node', 'externalId'],
                values: { parameter: 'directlyMappedIds' }
              }
            },
            {
              hasData: [COGNITE_VISUALIZABLE_SOURCE]
            }
          ]
        }
      }
    },
    indirectly_referenced_edges: {
      edges: {
        from: 'initial_nodes',
        direction: 'outwards',
        nodeFilter: {
          hasData: [COGNITE_VISUALIZABLE_SOURCE]
        }
      }
    },
    indirectly_referenced_nodes: {
      nodes: {
        from: 'indirectly_referenced_edges'
      }
    },
    initial_nodes_object_3ds: getObject3dRelation('initial_nodes'),
    initial_nodes_cad_nodes: getRevisionsCadNodeFromObject3D('initial_nodes_object_3ds'),
    initial_nodes_point_cloud_volumes: getRevisionsPointCloudVolumes('initial_nodes_object_3ds'),
    direct_nodes_object_3ds: getObject3dRelation('directly_referenced_nodes'),
    direct_nodes_cad_nodes: getRevisionsCadNodeFromObject3D('direct_nodes_object_3ds'),
    direct_nodes_point_cloud_volumes: getRevisionsPointCloudVolumes('direct_nodes_object_3ds'),
    indirect_nodes_object_3ds: getObject3dRelation('indirectly_referenced_nodes'),
    indirect_nodes_cad_nodes: getRevisionsCadNodeFromObject3D('indirect_nodes_object_3ds'),
    indirect_nodes_point_cloud_volumes: getRevisionsPointCloudVolumes('indirect_nodes_object_3ds')
  },
  select: {
    indirectly_referenced_edges: {},
    initial_nodes_object_3ds: { sources: cogniteObject3dSourceWithProperties },
    initial_nodes_cad_nodes: {
      sources: cadNodeSourceWithProperties
    },
    initial_nodes_point_cloud_volumes: { sources: pointCloudVolumeSourceWithProperties },
    direct_nodes_object_3ds: { sources: cogniteObject3dSourceWithProperties },
    direct_nodes_cad_nodes: {
      sources: cadNodeSourceWithProperties
    },
    direct_nodes_point_cloud_volumes: { sources: pointCloudVolumeSourceWithProperties },
    indirect_nodes_object_3ds: { sources: cogniteObject3dSourceWithProperties },
    indirect_nodes_cad_nodes: {
      sources: cadNodeSourceWithProperties
    },
    indirect_nodes_point_cloud_volumes: {
      sources: pointCloudVolumeSourceWithProperties
    }
  }
} as const satisfies Omit<QueryRequest, 'parameters' | 'cursor'>;

function getRevisionsCadNodeFromObject3D(object3dTableName: string): QueryTableExpressionV3 {
  return {
    nodes: {
      from: object3dTableName,
      through: { view: COGNITE_3D_OBJECT_SOURCE, identifier: 'cadNodes' },
      filter: {
        containsAny: {
          property: [
            COGNITE_CAD_NODE_SOURCE.space,
            COGNITE_CAD_NODE_SOURCE.externalId,
            'revisions'
          ],
          values: { parameter: 'revisionRefs' }
        }
      }
    }
  };
}

function getRevisionsPointCloudVolumes(object3dTableName: string): QueryTableExpressionV3 {
  return {
    nodes: {
      from: object3dTableName,
      through: { view: COGNITE_3D_OBJECT_SOURCE, identifier: 'pointCloudVolumes' },
      filter: {
        containsAny: {
          property: [
            COGNITE_POINT_CLOUD_VOLUME_SOURCE.space,
            COGNITE_POINT_CLOUD_VOLUME_SOURCE.externalId,
            'revisions'
          ],
          values: { parameter: 'revisionRefs' }
        }
      }
    }
  };
}

function getObject3dRelation(visualizableTableName: string): QueryTableExpressionV3 {
  return {
    nodes: {
      from: visualizableTableName,
      through: { view: COGNITE_VISUALIZABLE_SOURCE, identifier: 'object3d' }
    }
  };
}
