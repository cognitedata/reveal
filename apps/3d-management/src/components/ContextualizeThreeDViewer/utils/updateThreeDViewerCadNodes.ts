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

import {
  setContextualizedNodes,
  useContextualizeThreeDViewerStore,
} from '../useContextualizeThreeDViewerStore';

import { getCdfCadContextualization } from './getCdfCadContextualization';
import { updateStyleForContextualizedCadNodes } from './updateStyleForContextualizedCadNodes';

export const updateThreeDViewerCadNodes = async ({
  sdk,
  modelId,
  revisionId,
  model,
  contextualizedNodes,
  selectedNodes,
  selectedAndContextualizedNodes,
}: {
  sdk: CogniteClient;
  modelId: number;
  revisionId: number;
  model: CogniteCadModel;
  contextualizedNodes: ListResponse<AssetMapping3D[]>;
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
    cadMapping: contextualizedNodes,
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

  setContextualizedNodes(contextualizedNodes);
};
