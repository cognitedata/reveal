/*!
 * Copyright 2023 Cognite AS
 */

import { useQuery } from '@tanstack/react-query';

import { type CogniteCadModel } from '@cognite/reveal';
import { CogniteClient, type CogniteInternalId, type Node3D } from '@cognite/sdk';
import { type NodeDataResult } from '../components/Reveal3DResources/types';
import { useFdmSdk, useSDK } from '../components/RevealContainer/SDKProvider';
import { type FdmAssetMappingsConfig } from '..';

import assert from 'assert';
import {
  FdmSDK,
  type DmsUniqueIdentifier,
  type EdgeItem,
  type InspectResultList
} from '../utilities/FdmSDK';

export const useNodeMappedData = (
  treeIndex: number | undefined,
  model: CogniteCadModel | undefined,
  fdmConfig: FdmAssetMappingsConfig | undefined
): NodeDataResult | undefined => {

  const cogniteClient = useSDK();
  const fdmClient = useFdmSdk();

  const mappedDataHashKey = `${model?.modelId}-${model?.revisionId}-${treeIndex}`;

  const queryResult = useQuery(
    ['cdf', '3d', mappedDataHashKey],
    async () => {

      if (model === undefined || treeIndex === undefined) {
        return null;
      }

      const ancestors = await fetchAncestorNodesForTreeIndex(model, treeIndex, cogniteClient);

      if (ancestors.length === 0) {
        return null;
      }

      const mappings = await fetchNodeMappingEdges(fdmConfig, model, ancestors.map((n) => n.id), fdmClient);

      const selectedEdge =
        mappings !== undefined && mappings.edges.length > 0 ? mappings.edges[0] : undefined;

      const selectedNodeId =
        fdmConfig === undefined
        ? undefined
        : selectedEdge?.properties[fdmConfig.source.space][
          `${fdmConfig?.source.externalId}/${fdmConfig.source.version}`
        ].revisionNodeId;

      const dataNode = selectedEdge?.startNode;

      if (dataNode === undefined) {
        return null;
      }

      const inspectionResult = await inspectNode(dataNode, fdmClient);

      const dataView =
        inspectionResult?.items[0]?.inspectionResults.involvedViewsAndContainers?.views[0];

      if (dataView === undefined) {
        return null;
      }

      const selectedNode = ancestors.find((n) => n.id === selectedNodeId)!;

      return {
        nodeExternalId: dataNode.externalId,
        view: dataView,
        cadNode: selectedNode
      };
    });

  return queryResult.data ?? undefined;
};

async function fetchAncestorNodesForTreeIndex(
  model: CogniteCadModel,
  treeIndex: number,
  cogniteClient: CogniteClient,
): Promise<Node3D[]> {

  const nodeId = await model.mapTreeIndexToNodeId(treeIndex);

  const ancestorNodes = await cogniteClient.revisions3D.list3DNodeAncestors(
    model.modelId,
    model.revisionId,
    nodeId
  );

  return ancestorNodes.items;
}

async function fetchNodeMappingEdges(
  fdmConfig: FdmAssetMappingsConfig | undefined,
  model: CogniteCadModel,
  ancestorIds: CogniteInternalId[],
  fdmClient: FdmSDK
): Promise<{ edges: Array<EdgeItem<Record<string, any>>> } | undefined> {

  if (fdmConfig === undefined) {
    throw  new Error('FdmConfig must be supplied for using FDM endpoints');
  }

  assert(ancestorIds.length !== 0);

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

  return fdmClient.filterAllInstances(filter, 'edge', fdmConfig.source);
}

async function inspectNode(dataNode: DmsUniqueIdentifier, fdmClient: FdmSDK): Promise<InspectResultList | undefined> {

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
