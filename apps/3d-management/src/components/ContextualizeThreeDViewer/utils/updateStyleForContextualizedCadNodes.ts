import { Color } from 'three/src/Three';

import {
  CogniteCadModel,
  IndexSet,
  TreeIndexNodeCollection,
} from '@cognite/reveal';
import { CogniteClient } from '@cognite/sdk/dist/src';

import { getCdfThreeDAssetMappings } from './getCdfThreeDAssetMappings';

export const updateStyleForContextualizedCadNodes = async ({
  sdk,
  model,
  modelId,
  revisionId,
}: {
  sdk: CogniteClient;
  model: CogniteCadModel;
  modelId: number;
  revisionId: number;
}) => {
  const color = new Color(0.6, 0.2, 0.78);
  const mapping3D = await getCdfThreeDAssetMappings({
    sdk: sdk,
    modelId: modelId,
    revisionId: revisionId,
  });

  const mappedNodes = new TreeIndexNodeCollection();

  const treeIndices: Array<number> = [];
  mapping3D.items.forEach((item) => {
    treeIndices.push(item.treeIndex);
  });

  mappedNodes.updateSet(new IndexSet(treeIndices));

  model.assignStyledNodeCollection(mappedNodes, {
    color: color,
  });
};
