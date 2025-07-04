import { type CogniteClient } from '@cognite/sdk';
import { nodeIdsToTreeIndices } from '../../components/CacheProvider/requests';
import {
  type ModelId,
  type ModelRevisionKey,
  type NodeId,
  type RevisionId,
  type FdmCadConnection
} from '../../components/CacheProvider/types';
import { type DmsUniqueIdentifier, type EdgeItem } from '../FdmSDK';
import { type InModel3dEdgeProperties } from './dataModels';
import { executeParallel } from '../../utilities/executeParallel';
import { isDefined } from '../../utilities/isDefined';
import { chunk } from 'lodash';
import {
  createModelRevisionKey,
  revisionKeyToIds
} from '../../components/CacheProvider/idAndKeyTranslation';

const MAX_PARALLEL_QUERIES = 2;

type NodeIdConnection = {
  modelId: ModelId;
  revisionId: RevisionId;
  nodeId: NodeId;
  instance: DmsUniqueIdentifier;
};

export async function fdmEdgesToCadConnections(
  edges: Array<EdgeItem<InModel3dEdgeProperties>>,
  cogniteClient: CogniteClient
): Promise<FdmCadConnection[]> {
  const nodeIdConnectionsMap = createModelToNodeIdConnectionsMap(edges);

  const results = await executeParallel(
    [...nodeIdConnectionsMap.entries()].map(
      ([modelRevisionKey, connectionList]) =>
        async () =>
          await getTreeIndexConnectionsForNodeIdConnections(
            modelRevisionKey,
            connectionList,
            cogniteClient
          )
    ),
    MAX_PARALLEL_QUERIES
  );

  return results.flat().filter(isDefined);
}

function createModelToNodeIdConnectionsMap(
  edges: Array<EdgeItem<InModel3dEdgeProperties>>
): Map<ModelRevisionKey, NodeIdConnection[]> {
  return edges.reduce((connectionMap, edge) => {
    const modelId = Number(edge.endNode.externalId);
    const revisionKey = createModelRevisionKey(modelId, edge.properties.revisionId);

    const connectionObject = {
      nodeId: edge.properties.revisionNodeId,
      revisionId: edge.properties.revisionId,
      modelId,
      instance: edge.startNode
    };

    const objectList = connectionMap.get(revisionKey);
    if (objectList === undefined) {
      connectionMap.set(revisionKey, [connectionObject]);
    } else {
      objectList.push(connectionObject);
    }
    return connectionMap;
  }, new Map<ModelRevisionKey, NodeIdConnection[]>());
}

async function getTreeIndexConnectionsForNodeIdConnections(
  modelRevisionKey: ModelRevisionKey,
  connectionList: NodeIdConnection[],
  cogniteClient: CogniteClient
): Promise<FdmCadConnection[]> {
  const [modelId, revisionId] = revisionKeyToIds(modelRevisionKey);
  const connectionChunks = chunk(connectionList, 1000);

  const connectionResult: FdmCadConnection[] = [];

  for (const connectionChunk of connectionChunks) {
    const treeIndices = await nodeIdsToTreeIndices(
      modelId,
      revisionId,
      connectionChunk.map((connection) => connection.nodeId),
      cogniteClient
    );

    const cadConnections = connectionChunk.map((connection, ind) => ({
      modelId: connection.modelId,
      revisionId: connection.revisionId,
      treeIndex: treeIndices[ind],
      instance: connection.instance
    }));

    connectionResult.push(...cadConnections);
  }

  return connectionResult;
}
