/*!
 * Copyright 2023 Cognite AS
 */

import { type Cognite3DViewer, type PointerEventData, type CogniteCadModel } from '@cognite/reveal';
import { type CogniteInternalId, type CogniteClient, type Node3D } from '@cognite/sdk';
import {
  type EdgeItem,
  type InspectResultList,
  type FdmSDK,
  type DmsUniqueIdentifier,
  type Source,
  type FdmNode
} from '../../utilities/FdmSDK';
import { type FdmAssetMappingsConfig } from '../../hooks/types';
import { type NodeDataResult } from './types';
import assert from 'assert';

export async function queryMappedData<NodeType>(
  viewer: Cognite3DViewer,
  cdfClient: CogniteClient,
  fdmClient: FdmSDK,
  fdmConfig: FdmAssetMappingsConfig,
  clickEvent: PointerEventData
): Promise<NodeDataResult<NodeType> | undefined> {
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
    fdmConfig,
    model,
    ancestors.map((n) => n.id)
  );

  if (mappings.edges.length === 0) {
    return;
  }

  const selectedEdge = mappings.edges[0];
  const selectedNodeId =
    selectedEdge.properties[fdmConfig.source.space][
      `${fdmConfig.source.externalId}/${fdmConfig.source.version}`
    ].revisionNodeId;
  const selectedNode = ancestors.find((n) => n.id === selectedNodeId);
  assert(selectedNode !== undefined);

  const dataNode = selectedEdge.startNode;

  const inspectionResult = await inspectNode(fdmClient, dataNode);

  const dataView =
    inspectionResult.items[0]?.inspectionResults.involvedViewsAndContainers?.views[0];

  const nodeData = await filterNodeData<NodeType>(fdmClient, dataNode, dataView);

  if (nodeData === undefined) {
    return undefined;
  }

  return {
    data: nodeData,
    view: dataView,
    cadNode: selectedNode,
    model: cadIntersection.model
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
  fdmConfig: FdmAssetMappingsConfig,
  model: CogniteCadModel,
  ancestorIds: CogniteInternalId[]
): Promise<{ edges: Array<EdgeItem<Record<string, any>>> }> {
  const filter = {
    and: [
      {
        equals: {
          property: ['edge', 'endNode'],
          value: {
            space: fdmConfig.global3dSpace,
            externalId: `model_3d_${model.modelId}`
          }
        }
      },
      {
        equals: {
          property: [
            fdmConfig.source.space,
            `${fdmConfig.source.externalId}/${fdmConfig.source.version}`,
            'revisionId'
          ],
          value: model.revisionId
        }
      },
      {
        in: {
          property: [
            fdmConfig.source.space,
            `${fdmConfig.source.externalId}/${fdmConfig.source.version}`,
            'revisionNodeId'
          ],
          values: ancestorIds
        }
      }
    ]
  };

  return await fdmClient.filterAllInstances(filter, 'edge', fdmConfig.source);
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

async function filterNodeData<NodeType>(
  fdmClient: FdmSDK,
  dataNode: DmsUniqueIdentifier,
  dataView: Source
): Promise<FdmNode<NodeType> | undefined> {
  if (dataView === undefined) {
    return undefined;
  }

  const dataQueryResult = await fdmClient.getByExternalIds<NodeType>(
    [{ instanceType: 'node', ...dataNode }],
    dataView
  );

  return dataQueryResult.items[0];
}
