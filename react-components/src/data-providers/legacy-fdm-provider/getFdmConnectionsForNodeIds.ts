import { CogniteInternalId } from '@cognite/sdk/dist/src';
import { DmsUniqueIdentifier, FdmSDK } from '../FdmSDK';
import { FdmCadConnection } from '../../components/CacheProvider/types';
import { InModel3dEdgeProperties, SYSTEM_3D_EDGE_SOURCE } from './dataModels';
import { fdmEdgesToCadConnections } from './fdmEdgesToCadConnections';

export async function getFdmConnectionsForNodeIds(
  fdmClient: FdmSDK,
  models: DmsUniqueIdentifier[],
  revisionId: number,
  nodeIds: CogniteInternalId[]
): Promise<FdmCadConnection[]> {
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

  return fdmEdgesToCadConnections(results.instances);
}
