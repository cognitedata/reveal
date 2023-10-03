import { cadNodeStyles } from '@3d-management/pages/ContextualizeEditor/constants';
import { Color } from 'three/src/Three';

import {
  CogniteCadModel,
  IndexSet,
  NodeAppearance,
  NodeOutlineColor,
  TreeIndexNodeCollection,
} from '@cognite/reveal';
import {
  AssetMapping3D,
  CogniteClient,
  ListResponse,
} from '@cognite/sdk/dist/src';

import { setContextualizedNodes } from '../useContextualizeThreeDViewerStore';

import { getCdfCadContextualization } from './getCdfCadContextualization';

export const updateThreeDViewerCadNodes = async ({
  sdk,
  modelId,
  revisionId,
  model,
  contextualizedNodes,
  contextualizedNodesTreeIndex,
  selectedNodesTreeIndex,
  selectedAndContextualizedNodesTreeIndex,
}: {
  sdk: CogniteClient;
  modelId: number;
  revisionId: number;
  model: CogniteCadModel;
  nodesToReset: ListResponse<AssetMapping3D[]> | null;
  contextualizedNodes: ListResponse<AssetMapping3D[]> | null;
  contextualizedNodesTreeIndex: TreeIndexNodeCollection;
  selectedNodesTreeIndex: TreeIndexNodeCollection;
  selectedAndContextualizedNodesTreeIndex: TreeIndexNodeCollection;
}) => {
  // TODO: introduce FDM capabilities on updating the style in a way to not be tied on asset-centric
  if (!contextualizedNodes) {
    contextualizedNodes = await getCdfCadContextualization({
      sdk: sdk,
      modelId: modelId,
      revisionId: revisionId,
      nodeId: undefined,
    });
    setContextualizedNodes(contextualizedNodes);
  }

  const treeIndices: Array<number> = [];
  contextualizedNodes.items.forEach((item) => {
    treeIndices.push(item.treeIndex);
  });

  contextualizedNodesTreeIndex.updateSet(new IndexSet(treeIndices));

  model.assignStyledNodeCollection(contextualizedNodesTreeIndex, {
    color: cadNodeStyles[2] as Color,
    outlineColor: NodeOutlineColor.NoOutline,
  });

  model.assignStyledNodeCollection(
    selectedNodesTreeIndex,
    cadNodeStyles[1] as NodeAppearance
  );

  model.assignStyledNodeCollection(selectedAndContextualizedNodesTreeIndex, {
    color: cadNodeStyles[3] as Color,
    outlineColor: NodeOutlineColor.White,
  });
};
