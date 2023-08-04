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
import { type FdmAssetMappingsConfig } from '../../hooks/types';
import { type NodeDataResult } from './types';
import assert from 'assert';

export async function queryMappedData(
  viewer: Cognite3DViewer,
  cdfClient: CogniteClient,
  fdmClient: FdmSDK,
  clickEvent: PointerEventData,
  fdmConfig?: FdmAssetMappingsConfig
): Promise<NodeDataResult | undefined> {
  if (fdmConfig === undefined) {
    throw Error('Must supply fdmConfig when using FDM queries');
  }

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
