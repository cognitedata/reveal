/*!
 * Copyright 2024 Cognite AS
 */
import { type CogniteClient } from '@cognite/sdk/dist/src';
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
import {
  modelRevisionKeyToModelRevision,
  modelRevisionToKey
} from '../../components/CacheProvider/utils';
import { executeParallel } from '../../utilities/executeParallel';
import { isDefined } from '../../utilities/isDefined';

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
    const revisionKey = modelRevisionToKey(modelId, edge.properties.revisionId);

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
  const [modelId, revisionId] = modelRevisionKeyToModelRevision(modelRevisionKey);
  const treeIndices = await nodeIdsToTreeIndices(
    modelId,
    revisionId,
    connectionList.map((connection) => connection.nodeId),
    cogniteClient
  );

  return connectionList.map((connection, ind) => ({
    modelId: connection.modelId,
    revisionId: connection.revisionId,
    treeIndex: treeIndices[ind],
    instance: connection.instance
  }));
}
