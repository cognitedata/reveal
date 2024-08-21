/*!
 * Copyright 2024 Cognite AS
 */
import { SYSTEM_3D_EDGE_SOURCE } from './dataModels';
import { type DmsUniqueIdentifier, type FdmSDK } from '../FdmSDK';
import { type QueryRequest } from '@cognite/sdk/dist/src';

export async function getEdgeConnected3dInstances(
  instance: DmsUniqueIdentifier,
  fdmSdk: FdmSDK
): Promise<DmsUniqueIdentifier[]> {
  const nodesResult = await fdmSdk.queryNodesAndEdges({
    ...related3dEdgesQuery,
    parameters: {
      instanceExternalId: instance.externalId,
      instanceSpace: instance.space
    }
  });

  return nodesResult.items.connected_objects_with_3d.map((obj) => ({
    instanceType: 'node' as const,
    externalId: obj.externalId,
    space: obj.space
  }));
}

const related3dEdgesQuery = {
  with: {
    start_instance: {
      nodes: {
        filter: {
          and: [
            {
              equals: {
                property: ['node', 'externalId'],
                value: { parameter: 'instanceExternalId' }
              }
            },
            {
              equals: {
                property: ['node', 'space'],
                value: { parameter: 'instanceSpace' }
              }
            }
          ]
        }
      },
      limit: 1
    },
    start_to_object_edges: {
      edges: {
        from: 'start_instance',
        maxDistance: 1,
        direction: 'outwards'
      },
      limit: 1000
    },
    connected_objects_with_3d: {
      nodes: {
        from: 'start_to_object_edges',
        chainTo: 'destination'
      },
      limit: 1000
    },
    edges_of_3d_type: {
      edges: {
        from: 'connected_objects_with_3d',
        maxDistance: 1,
        direction: 'outwards',
        filter: {
          and: [
            {
              hasData: [SYSTEM_3D_EDGE_SOURCE]
            }
          ]
        }
      }
    },
    nodes_with_3d_connection: {
      nodes: {
        from: 'edges_of_3d_type',
        chainTo: 'source'
      },
      limit: 1000
    }
  },
  select: {
    start_instance: {},
    start_to_object_edges: {},
    connected_objects_with_3d: {},
    edges_of_3d_type: {},
    nodes_with_3d_connection: {}
  }
} as const satisfies Omit<QueryRequest, 'cursors' | 'parameters'>;
