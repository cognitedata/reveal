/*!
 * Copyright 2024 Cognite AS
 */
import {
  type QueryEdgeTableExpressionV3,
  type QueryNodeTableExpressionV3,
  type QueryRequest,
  type QueryTableExpressionV3,
  type SourceSelectorV3
} from '@cognite/sdk';
import {
  COGNITE_CAD_NODE_SOURCE,
  COGNITE_IMAGE_360_ANNOTATION_SOURCE,
  COGNITE_IMAGE_360_SOURCE,
  COGNITE_POINT_CLOUD_VOLUME_SOURCE,
  COGNITE_VISUALIZABLE_SOURCE,
  CORE_DM_3D_CONTAINER_SPACE
} from './dataModels';
import { type DmsUniqueIdentifier } from '..';
import { hasIdFilter } from './utils/filters';
import { cogniteImage360SourceWithOnlyCollection360 } from './cogniteImage360SourceWithProperties';

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

function getRevisionImage360AnnotationEdges(object3dTableName: string): QueryEdgeTableExpressionV3 {
  return {
    edges: {
      from: object3dTableName,
      direction: 'outwards',
      filter: { hasData: [COGNITE_IMAGE_360_ANNOTATION_SOURCE] }
    }
  };
}

function getRevisionImage360Images(
  annotationEdgeTableName: string,
  revisionRefs: DmsUniqueIdentifier[]
): QueryNodeTableExpressionV3 {
  return {
    nodes: {
      from: annotationEdgeTableName,
      chainTo: 'destination',
      filter: {
        and: [
          {
            hasData: [COGNITE_IMAGE_360_SOURCE]
          },
          {
            in: {
              property: [
                COGNITE_IMAGE_360_SOURCE.space,
                `${COGNITE_IMAGE_360_SOURCE.externalId}/${COGNITE_IMAGE_360_SOURCE.version}`,
                'collection360'
              ],
              values: revisionRefs
            }
          }
        ]
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

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function createCheck3dConnectedEquipmentQuery(
  initialNodes: DmsUniqueIdentifier[],
  revisionRefs: DmsUniqueIdentifier[]
) {
  return {
    with: {
      initial_nodes: {
        nodes: {
          filter: {
            and: [
              hasIdFilter(initialNodes),
              {
                hasData: [COGNITE_VISUALIZABLE_SOURCE]
              }
            ]
          }
        }
      },
      initial_nodes_object_3ds: getObject3dRelation('initial_nodes'),
      initial_nodes_cad_nodes: getRevisionsCadNodeFromObject3D('initial_nodes_object_3ds'),
      initial_nodes_point_cloud_volumes: getRevisionsPointCloudVolumes('initial_nodes_object_3ds'),
      initial_edges_360_image_annotations: getRevisionImage360AnnotationEdges(
        'initial_nodes_object_3ds'
      ),
      initial_nodes_360_images: getRevisionImage360Images(
        'initial_edges_360_image_annotations',
        revisionRefs
      ),

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
      indirect_nodes_object_3ds: getObject3dRelation('indirectly_referenced_nodes'),
      indirect_nodes_cad_nodes: getRevisionsCadNodeFromObject3D('indirect_nodes_object_3ds'),
      indirect_nodes_point_cloud_volumes: getRevisionsPointCloudVolumes(
        'indirect_nodes_object_3ds'
      ),
      indirect_edges_360_image_annotations: getRevisionImage360AnnotationEdges(
        'indirect_nodes_object_3ds'
      ),
      indirect_nodes_360_images: getRevisionImage360Images(
        'indirect_edges_360_image_annotations',
        revisionRefs
      )
    },
    select: {
      initial_nodes_cad_nodes: {
        sources: cadNodeSourceWithProperties
      },
      initial_nodes_point_cloud_volumes: { sources: pointCloudVolumeSourceWithProperties },
      initial_edges_360_image_annotations: {},
      initial_nodes_360_images: { sources: cogniteImage360SourceWithOnlyCollection360 },

      indirect_nodes_cad_nodes: {
        sources: cadNodeSourceWithProperties
      },
      indirect_nodes_point_cloud_volumes: {
        sources: pointCloudVolumeSourceWithProperties
      },
      indirect_edges_360_image_annotations: {},
      indirect_nodes_360_images: { sources: cogniteImage360SourceWithOnlyCollection360 }
    }
  } as const satisfies Omit<QueryRequest, 'parameters' | 'cursor'>;
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function createCheck3dConnectedEquipmentQueryNoIndirect(
  initialNodes: DmsUniqueIdentifier[],
  revisionRefs: DmsUniqueIdentifier[]
) {
  return {
    with: {
      initial_nodes: {
        nodes: {
          filter: {
            and: [
              hasIdFilter(initialNodes),
              {
                hasData: [COGNITE_VISUALIZABLE_SOURCE]
              }
            ]
          }
        }
      },
      initial_nodes_object_3ds: getObject3dRelation('initial_nodes'),
      initial_nodes_cad_nodes: getRevisionsCadNodeFromObject3D('initial_nodes_object_3ds'),
      initial_nodes_point_cloud_volumes: getRevisionsPointCloudVolumes('initial_nodes_object_3ds'),
      initial_edges_360_image_annotations: getRevisionImage360AnnotationEdges(
        'initial_nodes_object_3ds'
      ),
      initial_nodes_360_images: getRevisionImage360Images(
        'initial_edges_360_image_annotations',
        revisionRefs
      )
    },
    select: {
      initial_nodes_cad_nodes: {
        sources: cadNodeSourceWithProperties
      },
      initial_nodes_point_cloud_volumes: { sources: pointCloudVolumeSourceWithProperties },
      initial_edges_360_image_annotations: {},
      initial_nodes_360_images: { sources: cogniteImage360SourceWithOnlyCollection360 }
    }
  } as const satisfies Omit<QueryRequest, 'parameters' | 'cursor'>;
}
