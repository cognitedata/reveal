import { cadNodeStyles } from '@3d-management/pages/ContextualizeEditor/constants';
import { Color } from 'three/src/Three';

import {
  CogniteCadModel,
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
import { updateStyleForContextualizedCadNodes } from './updateStyleForContextualizedCadNodes';

export const updateThreeDViewerCadNodes = async ({
  sdk,
  modelId,
  revisionId,
  model,
  nodesToReset,
  contextualizedNodes,
  selectedNodes,
  selectedAndContextualizedNodes,
}: {
  sdk: CogniteClient;
  modelId: number;
  revisionId: number;
  model: CogniteCadModel;
  nodesToReset: ListResponse<AssetMapping3D[]> | null;
  contextualizedNodes: ListResponse<AssetMapping3D[]> | null;
  selectedNodes: TreeIndexNodeCollection;
  selectedAndContextualizedNodes: TreeIndexNodeCollection;
}) => {
  // TODO: introduce FDM capabilities on updating the style in a way to not be tied on asset-centric
  if (!contextualizedNodes) {
    contextualizedNodes = await getCdfCadContextualization({
      sdk: sdk,
      modelId: modelId,
      revisionId: revisionId,
      nodeId: undefined,
    });
  }

  updateStyleForContextualizedCadNodes({
    model,
    cadNodes: contextualizedNodes,
    nodeAppearance: null,
    color: cadNodeStyles[2] as Color,
    outlineColor: NodeOutlineColor.NoOutline,
  });

  model.assignStyledNodeCollection(
    selectedNodes,
    cadNodeStyles[1] as NodeAppearance
  );

  model.assignStyledNodeCollection(selectedAndContextualizedNodes, {
    color: cadNodeStyles[3] as Color,
    outlineColor: NodeOutlineColor.White,
  });

  if (nodesToReset) {
    updateStyleForContextualizedCadNodes({
      model,
      cadNodes: nodesToReset,
      nodeAppearance: cadNodeStyles[0] as NodeAppearance,
      color: null,
      outlineColor: NodeOutlineColor.NoOutline,
    });
  }

  setContextualizedNodes(contextualizedNodes);
};
