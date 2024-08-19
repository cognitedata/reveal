import { AddModelOptions } from '@cognite/reveal';
import { InstancesWithView } from '../../query/useSearchMappedEquipmentFDM';
import { QueryRequest, QueryTableExpressionV3 } from '@cognite/sdk/dist/src';
import { getDirectRelationProperties } from '../utils/getDirectRelationProperties';
import { COGNITE_3D_OBJECT_SOURCE, COGNITE_VISUALIZABLE_SOURCE } from './dataModels';
import { cogniteAssetSourceWithProperties } from './cogniteAssetSourceWithProperties';
import { DmsUniqueIdentifier } from '../FdmSDK';

export function filterNodesByMappedTo3d(
  nodes: InstancesWithView[],
  revisionRefs: DmsUniqueIdentifier[],
  spacesToSearch: string[]
): Promise<InstancesWithView[]> {
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
}

const checkEquipmentFilter: QueryRequest = {
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
    indirectly_referenced_nodes: {
      edges: {
        from: 'initial_nodes',
        direction: 'outwards',
        nodeFilter: {
          hasData: [COGNITE_VISUALIZABLE_SOURCE]
        }
      }
    },
    initial_nodes_object_3ds: getObject3dRelation('initial_nodes'),
    initial_nodes_assets: getAssetRelation('initial_nodes_object_3ds'),
    direct_nodes_object_3ds: getObject3dRelation('directly_referenced_nodes'),
    direct_nodes_assets: getAssetRelation('direct_nodes_object_3ds'),
    indirect_nodes_object_3ds: getObject3dRelation('indirectly_referenced_nodes'),
    indirect_nodes_assets: getAssetRelation('indirect_nodes_object_3ds')
  },
  select: {
    initial_nodes_assets: { sources: cogniteAssetSourceWithProperties },
    direct_nodes_assets: { sources: cogniteAssetSourceWithProperties },
    indirect_nodes_assets: { sources: cogniteAssetSourceWithProperties }
  }
}; // as const satisfies Omit<QueryRequest, 'parameters' | 'cursor'>;

function getObject3dRelation(visualizableTableName: string): QueryTableExpressionV3 {
  return {
    nodes: {
      from: visualizableTableName,
      through: { source: COGNITE_VISUALIZABLE_SOURCE, identifier: 'object3d' }
    }
  };
}

function getAssetRelation(object3dTableName: string): QueryTableExpressionV3 {
  return {
    nodes: {
      from: object3dTableName,
      through: { source: COGNITE_3D_OBJECT_SOURCE, identifier: 'assets' }
    }
  };
}
