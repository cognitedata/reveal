/*!
 * Copyright 2023 Cognite AS
 */

import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { useFdmSdk } from '../components/RevealContainer/SDKProvider';
import { type QueryResult, type DmsUniqueIdentifier } from '../utilities/FdmSDK';

export function use3dRelatedEdgeConnections(
  fdmId: DmsUniqueIdentifier | undefined
): UseQueryResult<
  QueryResult<
    Related3dEdgesQueryType & { parameters: { instanceExternalId: string; instanceSpace: string } }
  >
> {
  const fdmSdk = useFdmSdk();

  return useQuery(
    ['reveal-react-components', 'get-3d-related-edge-connections'],
    async () =>
      await fdmSdk.queryNodesAndEdges({
        ...related3dEdgesQuery,
        parameters: {
          instanceExternalId: fdmId?.externalId ?? '',
          instanceSpace: fdmId?.space ?? ''
        }
      }),
    { enabled: fdmId !== undefined }
  );
}

type Related3dEdgesQueryType = typeof related3dEdgesQuery;

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
              hasData: [
                {
                  type: 'view',
                  space: 'cdf_3d_schema',
                  externalId: 'Cdf3dConnectionProperties',
                  version: '1'
                }
              ]
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
} as const;
