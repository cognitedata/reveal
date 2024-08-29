/*!
 * Copyright 2024 Cognite AS
 */
import { type InstancesWithView } from '../../query/useSearchMappedEquipmentFDM';
import {
  type QueryRequest,
  type QueryTableExpressionV3,
  type SourceSelectorV3
} from '@cognite/sdk';
import { getDirectRelationProperties } from '../utils/getDirectRelationProperties';
import {
  type Cognite3DObjectProperties,
  COGNITE_3D_OBJECT_SOURCE,
  COGNITE_CAD_NODE_SOURCE,
  COGNITE_POINT_CLOUD_VOLUME_SOURCE,
  COGNITE_VISUALIZABLE_SOURCE,
  CORE_DM_3D_CONTAINER_SPACE
} from './dataModels';
import { type DmsUniqueIdentifier, type FdmSDK } from '../FdmSDK';
import { cogniteObject3dSourceWithProperties } from './cogniteObject3dSourceWithProperties';
import { type FdmKey } from '../../components/CacheProvider/types';
import { toFdmKey } from '../utils/toFdmKey';
import { type PromiseType } from '../utils/typeUtils';
import { isString } from 'lodash';
import { type QueryResult } from '../utils/queryNodesAndEdges';

export async function filterNodesByMappedTo3d(
  nodes: InstancesWithView[],
  revisionRefs: DmsUniqueIdentifier[],
  _spacesToSearch: string[],
  fdmSdk: FdmSDK
): Promise<InstancesWithView[]> {
  const connectionData = await fetchConnectionData(nodes, revisionRefs, fdmSdk);

  const object3dKeys: Set<FdmKey> = createRelevantObject3dKeys(connectionData);

  const result = nodes.map((viewWithNodes) => {
    if (viewWithNodes.view.externalId !== 'CogniteAsset') {
      return {
        view: viewWithNodes.view,
        instances: []
      };
    }
    return {
      view: viewWithNodes.view,
      instances: viewWithNodes.instances.filter((instance) => {
        const object3dId = instance.properties.object3D as unknown as
          | DmsUniqueIdentifier
          | undefined;
        if (!isString(object3dId?.externalId) || !isString(object3dId?.space)) {
          return false;
        }
        return object3dKeys.has(toFdmKey(object3dId));
      })
    };
  });

  return result;
}

function createRelevantObject3dKeys(
  connectionData: PromiseType<ReturnType<typeof fetchConnectionData>>
): Set<FdmKey> {
  const cadObject3dList = [...connectionData.items.initial_nodes_cad_nodes]
    .concat(connectionData.items.direct_nodes_cad_nodes)
    .concat(connectionData.items.indirect_nodes_cad_nodes)
    .map((node) => toFdmKey(node.properties.cdf_cdm['CogniteCADNode/v1'].object3D));

  const pointCloudObject3dList = [...connectionData.items.initial_nodes_point_cloud_volumes]
    .concat(connectionData.items.direct_nodes_point_cloud_volumes)
    .concat(connectionData.items.indirect_nodes_point_cloud_volumes)
    .map((pointCloudVolume) =>
      toFdmKey(pointCloudVolume.properties.cdf_cdm['CognitePointCloudVolume/v1'].object3D)
    );

  return new Set<FdmKey>([...cadObject3dList, ...pointCloudObject3dList]);
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
    node.instances.flatMap((instance) =>
      getDirectRelationProperties(instance).map((props) => props.externalId)
    )
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
      through: { view: COGNITE_CAD_NODE_SOURCE, identifier: 'object3D' },
      filter: {
        containsAny: {
          property: [CORE_DM_3D_CONTAINER_SPACE, COGNITE_CAD_NODE_SOURCE.externalId, 'revisions'],
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
      through: { view: COGNITE_POINT_CLOUD_VOLUME_SOURCE, identifier: 'object3D' },
      filter: {
        containsAny: {
          property: [
            CORE_DM_3D_CONTAINER_SPACE,
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
      through: { view: COGNITE_VISUALIZABLE_SOURCE, identifier: 'object3D' },
      direction: 'outwards'
    }
  };
}
