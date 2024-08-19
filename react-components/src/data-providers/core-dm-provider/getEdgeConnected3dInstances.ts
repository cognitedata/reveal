import { QueryRequest } from '@cognite/sdk/dist/src';
import { DmsUniqueIdentifier, FdmSDK } from '../FdmSDK';
import {
  Cognite3DObjectProperties,
  COGNITE_3D_OBJECT_SOURCE,
  COGNITE_VISUALIZABLE_SOURCE
} from './dataModels';

export async function getEdgeConnected3dInstances(
  instance: DmsUniqueIdentifier,
  fdmSdk: FdmSDK
): Promise<DmsUniqueIdentifier[]> {
  const query = {
    ...related3dEdgesQuery,
    parameters: { instanceExternalId: instance.externalId, instanceSpace: instance.space }
  } as const satisfies QueryRequest;

  const result = await fdmSdk.queryNodesAndEdges<
    typeof related3dEdgesQuery,
    [{ source: typeof COGNITE_3D_OBJECT_SOURCE; properties: Cognite3DObjectProperties }]
  >(query);

  return result.items.connected_objects_with_3d;
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
    objects_connected_with_3d: {
      nodes: {
        from: 'start_to_object_edges',
        chainTo: 'destination',
        filter: {
          exists: { property: ['CogniteVisualizable', 'object3D'] }
        }
      }
    },
    object_3ds: {
      nodes: {
        from: 'objects_connected_with_3d',
        through: { view: COGNITE_VISUALIZABLE_SOURCE, identifier: 'object3D' }
      },
      limit: 1000
    }
  },
  select: {
    start_instance: {},
    start_to_object_edges: {},
    connected_objects_with_3d: {},
    object_3ds: {}
  }
} as const satisfies Omit<QueryRequest, 'cursors' | 'parameters'>;
