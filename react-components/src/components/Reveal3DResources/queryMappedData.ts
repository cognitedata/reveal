/*!
 * Copyright 2023 Cognite AS
 */

import { type Cognite3DViewer, type PointerEventData, type CogniteCadModel } from '@cognite/reveal';
import { type CogniteInternalId, type CogniteClient, type Node3D } from '@cognite/sdk';
import {
  type EdgeItem,
  type InspectResultList,
  type FdmSDK,
  type DmsUniqueIdentifier
} from '../../utilities/FdmSDK';
import { type NodeDataResult } from './types';
import assert from 'assert';
import {
  INSTANCE_SPACE_3D_DATA,
  type InModel3dEdgeProperties,
  SYSTEM_3D_EDGE_SOURCE
} from '../../utilities/globalDataModels';

export async function queryMappedData(
  viewer: Cognite3DViewer,
  cdfClient: CogniteClient,
  fdmClient: FdmSDK,
  clickEvent: PointerEventData
): Promise<NodeDataResult | undefined> {
  const intersection = await viewer.getIntersectionFromPixel(
    clickEvent.offsetX,
    clickEvent.offsetY
  );

  if (intersection === null || intersection.type !== 'cad') {
    return;
  }

  const cadIntersection = intersection;
  const model = cadIntersection.model;

  const ancestors = await getAncestorNodesForTreeIndex(cdfClient, model, cadIntersection.treeIndex);

  const mappings = await getMappingEdges(
    fdmClient,
    model,
    ancestors.map((n) => n.id)
  );

  if (mappings.edges.length === 0) {
    return;
  }

  const selectedEdge = mappings.edges[0];
  const selectedNodeId = selectedEdge.properties.revisionNodeId;
  const selectedNode = ancestors.find((n) => n.id === selectedNodeId);
  assert(selectedNode !== undefined);

  const dataNode = selectedEdge.startNode;

  const inspectionResult = await inspectNode(fdmClient, dataNode);

  const dataView =
    inspectionResult.items[0]?.inspectionResults.involvedViewsAndContainers?.views[0];

  return {
    nodeExternalId: dataNode.externalId,
    view: dataView,
    cadNode: selectedNode,
    intersection: cadIntersection
  };
}

async function getAncestorNodesForTreeIndex(
  client: CogniteClient,
  model: CogniteCadModel,
  treeIndex: number
): Promise<Node3D[]> {
  const nodeId = await model.mapTreeIndexToNodeId(treeIndex);

  const ancestorNodes = await client.revisions3D.list3DNodeAncestors(
    model.modelId,
    model.revisionId,
    nodeId
  );

  return ancestorNodes.items;
}

async function getMappingEdges(
  fdmClient: FdmSDK,
  model: CogniteCadModel,
  ancestorIds: CogniteInternalId[]
): Promise<{ edges: Array<EdgeItem<InModel3dEdgeProperties>> }> {
  const filter = {
    and: [
      {
        equals: {
          property: ['edge', 'endNode'],
          value: {
            space: INSTANCE_SPACE_3D_DATA,
            externalId: `${model.modelId}`
          }
        }
      },
      {
        equals: {
          property: [
            SYSTEM_3D_EDGE_SOURCE.space,
            `${SYSTEM_3D_EDGE_SOURCE.externalId}/${SYSTEM_3D_EDGE_SOURCE.version}`,
            'revisionId'
          ],
          value: model.revisionId
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

  return await fdmClient.filterAllInstances<InModel3dEdgeProperties>(
    filter,
    'edge',
    SYSTEM_3D_EDGE_SOURCE
  );
}

async function inspectNode(
  fdmClient: FdmSDK,
  dataNode: DmsUniqueIdentifier
): Promise<InspectResultList> {
  const inspectionResult = await fdmClient.inspectInstances({
    inspectionOperations: { involvedViewsAndContainers: {} },
    items: [
      {
        instanceType: 'node',
        externalId: dataNode.externalId,
        space: dataNode.space
      }
    ]
  });

  return inspectionResult;
}
