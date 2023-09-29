import { Color } from 'three/src/Three';

import {
  CogniteCadModel,
  IndexSet,
  NodeOutlineColor,
  TreeIndexNodeCollection,
} from '@cognite/reveal';
import { AssetMapping3D, ListResponse } from '@cognite/sdk/dist/src';

export const updateStyleForContextualizedCadNodes = async ({
  model,
  cadMapping,
  color,
  outlineColor,
}: {
  model: CogniteCadModel;
  cadMapping: ListResponse<AssetMapping3D[]>;
  color: Color;
  outlineColor: NodeOutlineColor;
}) => {
  // TODO: introduce FDM capabilities on updating the style in a way to not be tied on asset-centric
  const mappedNodes = new TreeIndexNodeCollection();

  const treeIndices: Array<number> = [];
  cadMapping.items.forEach((item) => {
    treeIndices.push(item.treeIndex);
  });

  mappedNodes.updateSet(new IndexSet(treeIndices));

  model.assignStyledNodeCollection(mappedNodes, {
    color: color,
    outlineColor: outlineColor,
  });
};
