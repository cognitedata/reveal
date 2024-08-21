/*!
 * Copyright 2024 Cognite AS
 */
import { type CogniteClient, type Node3D } from '@cognite/sdk';
import { type DmsUniqueIdentifier, type FdmSDK } from '../FdmSDK';
import { type FdmCadConnection } from '../../components/CacheProvider/types';
import { type InModel3dEdgeProperties, SYSTEM_3D_EDGE_SOURCE } from './dataModels';
import { fdmEdgesToCadConnections } from './fdmEdgesToCadConnections';

export async function getFdmConnectionsForNodes(
  fdmClient: FdmSDK,
  cogniteClient: CogniteClient,
  models: DmsUniqueIdentifier[],
  revisionId: number,
  nodes: Node3D[]
): Promise<FdmCadConnection[]> {
  const nodeIds = nodes.map((node) => node.id);

  const filter = {
    and: [
      {
        in: {
          property: ['edge', 'endNode'],
          values: models.map((model) => ({
            externalId: model.externalId,
            space: model.space
          }))
        }
      },
      {
        equals: {
          property: [
            SYSTEM_3D_EDGE_SOURCE.space,
            `${SYSTEM_3D_EDGE_SOURCE.externalId}/${SYSTEM_3D_EDGE_SOURCE.version}`,
            'revisionId'
          ],
          value: revisionId
        }
      },
      {
        in: {
          property: [
            SYSTEM_3D_EDGE_SOURCE.space,
            `${SYSTEM_3D_EDGE_SOURCE.externalId}/${SYSTEM_3D_EDGE_SOURCE.version}`,
            'revisionNodeId'
          ],
          values: nodeIds
        }
      }
    ]
  };

  const results = await fdmClient.filterAllInstances<InModel3dEdgeProperties>(
    filter,
    'edge',
    SYSTEM_3D_EDGE_SOURCE
  );

  return await fdmEdgesToCadConnections(results.instances, cogniteClient);
}
