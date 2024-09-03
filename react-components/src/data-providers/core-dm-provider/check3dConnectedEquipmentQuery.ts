import { QueryRequest, QueryTableExpressionV3, SourceSelectorV3 } from '@cognite/sdk/dist/src';
import { cogniteObject3dSourceWithProperties } from './cogniteObject3dSourceWithProperties';
import {
  COGNITE_CAD_NODE_SOURCE,
  COGNITE_POINT_CLOUD_VOLUME_SOURCE,
  COGNITE_VISUALIZABLE_SOURCE,
  CORE_DM_3D_CONTAINER_SPACE
} from './dataModels';

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

export const check3dConnectedEquipmentQuery = {
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
