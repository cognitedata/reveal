/*!
 * Copyright 2023 Cognite AS
 */

import { useQuery } from '@tanstack/react-query';
import { useFdmSdk } from '../components/RevealContainer/SDKProvider';
import { DmsUniqueIdentifier } from '../utilities/FdmSDK';

export function use3dRelatedEdgeConnections(fdmId: DmsUniqueIdentifier | undefined) {
  const fdmSdk = useFdmSdk();

  return useQuery(['reveal-react-components',
                   'get-3d-related-edge-connections'],
                  async () => fdmSdk.queryNodesAndEdges(getQuery(fdmId?.externalId ?? '', fdmId?.space ?? '')),
                  { enabled: fdmId !== undefined });
}

function getQuery(externalId: string, space: string) {
  return {
    "with": {
      "start_instance": {
        "nodes": {
          "filter": {
            "and": [
              {
                "equals": {
                  "property": [
                    "node",
                    "externalId"
                  ],
                  "value": externalId
                }
              },
              {
                "equals": {
                  "property": [
                    "node",
                    "space"
                  ],
                  "value": space
                }
              }
            ]
          }
        },
        "limit": 1
      },
      "start_to_object_edges": {
        "edges": {
          "from": "start_instance",
          "maxDistance": 1,
          "direction": "outwards" as const
        },
        "limit": 1000
      },
      "connected_objects_with_3d": {
        "nodes": {
          "from": "start_to_object_edges",
          "chainTo": "destination" as const
        },
        "limit": 1000
      },
      "edges_of_3d_type": {
        "edges": {
          "from": "connected_objects_with_3d",
          "maxDistance": 1,
          "direction": "outwards" as const,
          "filter": {
            "and": [
              {
                "hasData": [
                  {
                    "type": "view",
                    "space": "cdf_3d_schema",
                    "externalId": "Cdf3dConnectionProperties",
                    "version": "1"
                  }
                ]
              }
            ]
          }
        }
      },
      "nodes_with_3d_connection": {
        "nodes": {
          "from": "edges_of_3d_type",
          "chainTo": "source" as const
        },
        "limit": 1000
      }
    },
    "select": {
      "start_instance": {},
      "start_to_object_edges": {},
      "connected_objects_with_3d": {},
      "edges_of_3d_type": {},
      "nodes_with_3d_connection": {}
    }
  };
}
