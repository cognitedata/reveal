/*!
 * Copyright 2023 Cognite AS
 */

import { useQuery } from '@tanstack/react-query';

import { type PointerEventData, type CogniteCadModel, type CadIntersection } from '@cognite/reveal';
import { type CogniteInternalId, type Node3D } from '@cognite/sdk';
import { type NodeDataResult } from '../components/Reveal3DResources/types';
import { useFdmSdk, useSDK } from '../components/RevealContainer/SDKProvider';
import { useEffect, useState } from 'react';
import { type FdmAssetMappingsConfig, useReveal } from '..';

import assert from 'assert';
import {
  type DmsUniqueIdentifier,
  type EdgeItem,
  type InspectResultList
} from '../utilities/FdmSDK';

export const useNodeMappedData = (
  clickEvent: PointerEventData | undefined,
  fdmConfig: FdmAssetMappingsConfig | undefined
): NodeDataResult | undefined => {
  const viewer = useReveal();

  const [cadIntersection, setCadIntersection] = useState<CadIntersection | undefined>(undefined);

  useEffect(() => {
    void (async () => {
      if (clickEvent === undefined) {
        return;
      }

      const intersection = await viewer.getIntersectionFromPixel(
        clickEvent.offsetX,
        clickEvent.offsetY
      );

      if (intersection === null || intersection.type !== 'cad') {
        return;
      }

      const cadIntersection = intersection;
      setCadIntersection(cadIntersection);
    })();
  }, [clickEvent]);

  const ancestors = useAncestorNodesForTreeIndex(
    cadIntersection?.model,
    cadIntersection?.treeIndex
  );

  const mappings = useNodeMappingEdges(
    fdmConfig,
    cadIntersection?.model,
    ancestors?.map((n) => n.id)
  );

  const selectedEdge =
    mappings !== undefined && mappings.edges.length > 0 ? mappings.edges[0] : undefined;
  const selectedNodeId =
    fdmConfig === undefined
      ? undefined
      : selectedEdge?.properties[fdmConfig.source.space][
          `${fdmConfig?.source.externalId}/${fdmConfig.source.version}`
        ].revisionNodeId;

  const dataNode = selectedEdge?.startNode;

  const inspectionResult = useInspectNode(dataNode);

  const dataView =
    inspectionResult?.items[0]?.inspectionResults.involvedViewsAndContainers?.views[0];

  const selectedNode = ancestors?.find((n) => n.id === selectedNodeId);

  if (
    selectedNode === undefined ||
    dataView === undefined ||
    dataNode === undefined ||
    cadIntersection === undefined
  ) {
    return undefined;
  }

  return {
    nodeExternalId: dataNode.externalId,
    view: dataView,
    cadNode: selectedNode,
    intersection: cadIntersection
  };
};

function useAncestorNodesForTreeIndex(
  model: CogniteCadModel | undefined,
  treeIndex: number | undefined
): Node3D[] | undefined {
  const cogniteClient = useSDK();

  const nodeHashKey = `${model?.modelId ?? 0}-${model?.revisionId ?? 0}-${treeIndex ?? 0}`;

  const queryResult = useQuery(
    ['cdf', '3d', 'tree-index-to-ancestors', nodeHashKey],
    async () => {
      assert(model !== undefined && treeIndex !== undefined);

      const nodeId = await model.mapTreeIndexToNodeId(treeIndex);

      const ancestorNodes = await cogniteClient.revisions3D.list3DNodeAncestors(
        model.modelId,
        model.revisionId,
        nodeId
      );

      return ancestorNodes.items;
    },
    { enabled: model !== undefined && treeIndex !== undefined }
  );

  return queryResult.data;
}

function useNodeMappingEdges(
  fdmConfig: FdmAssetMappingsConfig | undefined,
  model: CogniteCadModel | undefined,
  ancestorIds: CogniteInternalId[] | undefined
): { edges: Array<EdgeItem<Record<string, any>>> } | undefined {
  const fdmClient = useFdmSdk();

  const queryResult = useQuery(
    ['fdm', '3d', 'node-mapping-edges', ancestorIds],
    async () => {
      assert(
        fdmConfig !== undefined &&
          model !== undefined &&
          ancestorIds !== undefined &&
          ancestorIds.length !== 0
      );

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
    },
    {
      enabled:
        fdmConfig !== undefined &&
        model !== undefined &&
        ancestorIds !== undefined &&
        ancestorIds.length !== 0
    }
  );

  return queryResult.data;
}

function useInspectNode(dataNode: DmsUniqueIdentifier | undefined): InspectResultList | undefined {
  const fdmClient = useFdmSdk();

  const nodeHashKey = `${dataNode?.space ?? ''}-${dataNode?.externalId ?? ''}`;

  const inspectionResult = useQuery(
    ['fdm', '3d', 'inspect', nodeHashKey],
    async () => {
      assert(dataNode !== undefined);

      return await fdmClient.inspectInstances({
        inspectionOperations: { involvedViewsAndContainers: {} },
        items: [
          {
            instanceType: 'node',
            externalId: dataNode.externalId,
            space: dataNode.space
          }
        ]
      });
    },
    {
      enabled: dataNode !== undefined
    }
  );

  return inspectionResult.data;
}
