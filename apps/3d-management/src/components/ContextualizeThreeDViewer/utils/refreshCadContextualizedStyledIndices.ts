import { TreeIndexNodeCollection } from '@cognite/reveal';
import { AssetMapping3D } from '@cognite/sdk/dist/src';

export const refreshCadContextualizedStyledIndices = async ({
  contextualizedNodesStyleIndex,
  contextualizedNodes,
}: {
  contextualizedNodes: AssetMapping3D[];
  contextualizedNodesStyleIndex: TreeIndexNodeCollection;
}) => {
  const contextualizedIndex = contextualizedNodesStyleIndex.getIndexSet();
  contextualizedIndex.clear();
  contextualizedNodes?.forEach((node) => {
    contextualizedIndex.add(node.treeIndex);
  });
  contextualizedNodesStyleIndex.updateSet(contextualizedIndex);
};
