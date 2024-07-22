/*!
 * Copyright 2023 Cognite AS
 */

import { type CogniteClient, type CogniteInternalId, type Node3D } from '@cognite/sdk';
import {
  type Source,
  type DmsUniqueIdentifier,
  type FdmSDK,
  type InspectResultList,
  type EdgeItem
} from '../../data-providers/FdmSDK';
import { type FdmCadConnection } from './types';
import {
  type InModel3dEdgeProperties,
  SYSTEM_3D_EDGE_SOURCE,
  SYSTEM_SPACE_3D_SCHEMA,
  SYSTEM_SPACE_3D_MODEL_ID,
  SYSTEM_SPACE_3D_MODEL_VERSION
} from '../../utilities/globalDataModels';
import { chunk } from 'lodash';

export async function fetchAncestorNodesForTreeIndex(
  modelId: number,
  revisionId: number,
  treeIndex: number,
  cogniteClient: CogniteClient
): Promise<Node3D[]> {
  const nodeId = await treeIndexesToNodeIds(modelId, revisionId, [treeIndex], cogniteClient);

  const ancestorNodes = await cogniteClient.revisions3D.list3DNodeAncestors(
    modelId,
    revisionId,
    nodeId[0]
  );

  return ancestorNodes.items;
}

export async function getDMSModels(
  modelId: number,
  fdmClient: FdmSDK
): Promise<DmsUniqueIdentifier[]> {
  const filter = {
    equals: {
      property: ['node', 'externalId'],
      value: `${modelId}`
    }
  };
  const sources: Source = {
    type: 'view',
    space: SYSTEM_SPACE_3D_SCHEMA,
    externalId: SYSTEM_SPACE_3D_MODEL_ID,
    version: SYSTEM_SPACE_3D_MODEL_VERSION
  };

  const modelResults = await fdmClient.filterInstances(filter, 'node', sources);
  return modelResults.instances;
}

export async function getMappingEdgesForNodeIds(
  models: DmsUniqueIdentifier[],
  revisionId: number,
  fdmClient: FdmSDK,
  ancestorIds: CogniteInternalId[]
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
          values: ancestorIds
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

export function fdmEdgesToCadConnections(
  edges: Array<EdgeItem<InModel3dEdgeProperties>>
): FdmCadConnection[] {
  return edges.map((instance) => ({
    nodeId: instance.properties.revisionNodeId,
    revisionId: instance.properties.revisionId,
    modelId: Number(instance.endNode.externalId),
    instance: instance.startNode
  }));
}

export async function inspectNodes(
  fdmClient: FdmSDK,
  dataNodes: DmsUniqueIdentifier[]
): Promise<InspectResultList> {
  const chunkedNodes = chunk(dataNodes, 100);

  const inspectionResult: InspectResultList = {
    items: []
  };

  for (const nodesChunk of chunkedNodes) {
    const chunkInspectionResults = await fdmClient.inspectInstances({
      inspectionOperations: { involvedViews: {} },
      items: nodesChunk.map((node) => ({
        instanceType: 'node',
        externalId: node.externalId,
        space: node.space
      }))
    });

    inspectionResult.items.push(...chunkInspectionResults.items);
  }

  return inspectionResult;
}

export async function treeIndexesToNodeIds(
  modelId: number,
  revisionId: number,
  treeIndexes: number[],
  cogniteClient: CogniteClient
): Promise<number[]> {
  const outputsUrl = `${cogniteClient.getBaseUrl()}/api/v1/projects/${
    cogniteClient.project
  }/3d/models/${modelId}/revisions/${revisionId}/nodes/internalids/bytreeindices`;
  const response = await cogniteClient.post<{ items: number[] }>(outputsUrl, {
    data: { items: treeIndexes }
  });
  if (response.status === 200) {
    return response.data.items;
  } else {
    throw Error(`treeIndex-nodeId translation failed for treeIndexes ${treeIndexes.join(',')}`);
  }
}

export async function fetchNodesForNodeIds(
  modelId: number,
  revisionId: number,
  nodeIds: number[],
  cogniteClient: CogniteClient
): Promise<Node3D[]> {
  if (nodeIds.length === 0) {
    return [];
  }
  return await cogniteClient.revisions3D.retrieve3DNodes(
    modelId,
    revisionId,
    nodeIds.map((id) => ({ id }))
  );
}
