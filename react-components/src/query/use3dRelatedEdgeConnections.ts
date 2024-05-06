/*!
 * Copyright 2023 Cognite AS
 */

import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { useFdmSdk } from '../components/RevealCanvas/SDKProvider';
import { type DmsUniqueIdentifier } from '../utilities/FdmSDK';
import { zipWith } from 'lodash';
import { type FdmInstanceWithView } from '../utilities/types';
import assert from 'assert';
import { SYSTEM_3D_EDGE_SOURCE } from '../utilities/globalDataModels';

export function use3dRelatedEdgeConnections(
  fdmId: DmsUniqueIdentifier | undefined
): UseQueryResult<FdmInstanceWithView[]> {
  const fdmSdk = useFdmSdk();

  return useQuery({
    queryKey: [
      'reveal-react-components',
      'get-3d-related-edge-connections',
      fdmId?.externalId,
      fdmId?.space
    ],
    queryFn: async () => {
      assert(fdmId !== undefined);
      const nodesResult = await fdmSdk.queryNodesAndEdges({
        ...related3dEdgesQuery,
        parameters: {
          instanceExternalId: fdmId.externalId,
          instanceSpace: fdmId.space
        }
      });

      const nodeIds = nodesResult.items.connected_objects_with_3d.map((obj) => ({
        instanceType: 'node' as const,
        externalId: obj.externalId,
        space: obj.space
      }));

      if (nodeIds.length === 0) {
        return [];
      }

      const views = await fdmSdk.inspectInstances({
        inspectionOperations: { involvedViews: {} },
        items: nodeIds
      });

      return zipWith(nodeIds, views.items, (node, view) => ({
        ...node,
        view: view.inspectionResults.involvedViews[0]
      }));
    },
    enabled: fdmId !== undefined
  });
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
} as const;
