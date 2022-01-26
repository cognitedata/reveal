import React, { useCallback, useEffect } from 'react';

import {
  TreeIndexNodeCollection,
  Cognite3DModel,
  DefaultNodeAppearance,
  IndexSet,
  NumericRange,
} from '@cognite/reveal';
import { TreeDataNode } from 'src/pages/RevisionDetails/components/TreeView/types';
import { traverseTree } from 'src/pages/RevisionDetails/components/TreeView/utils/treeFunctions';
import { subtreeHasTreeIndex } from 'src/store/modules/TreeView/treeViewUtils';
import { assignOrUpdateStyledNodeCollection } from 'src/utils/sdk/3dNodeStylingUtils';

type Args = {
  model: Cognite3DModel;
  treeData: Array<TreeDataNode>;
  checkedKeys: Array<number>;
};

export function useCheckedNodesVisibility({
  model,
  treeData,
  checkedKeys,
}: Args) {
  const hiddenNodesSet = React.useRef(new IndexSet());
  const hiddenNodesStyledSet = React.useRef(
    new TreeIndexNodeCollection(hiddenNodesSet.current)
  );

  const nodesVisibilityChanged = useCallback(
    (newTreeData: typeof treeData, checkedKeysSet: Set<number>) => {
      traverseTree(newTreeData, (key, node) => {
        if (typeof key !== 'number') {
          return false;
        }

        // make sure the whole subtree is visible and stop traversing
        if (checkedKeysSet.has(key)) {
          // we need to reapply styling only if node is about to be hidden
          if (hiddenNodesSet.current.contains(key)) {
            hiddenNodesSet.current.removeRange(
              new NumericRange(key, node.meta.subtreeSize)
            );
          }

          // when node is checked, all its children checked too, so stop traversing
          return false;
        }

        // if `key` which is not checked isn't in the hidden set – we need to add it there,
        // but `key` can be removed from checkedSet if one of its children removed,
        // so we need to figure out whether to hide the whole subtree, or only that key

        const allKnownChildrenAreHidden = () =>
          ![...checkedKeysSet.values()].some((checkedIndex) =>
            subtreeHasTreeIndex(node as TreeDataNode, checkedIndex)
          );

        // no point to traverse when there is no visible ancestors, just hide them all
        if (
          node.meta.subtreeSize > 1 &&
          (!node.children || allKnownChildrenAreHidden())
        ) {
          hiddenNodesSet.current.addRange(
            new NumericRange(key, node.meta.subtreeSize)
          );
          return false;
        }

        hiddenNodesSet.current.add(key);

        // must keep looking for every visible child
        return true;
      });

      hiddenNodesStyledSet.current.updateSet(hiddenNodesSet.current);
    },
    []
  );

  useEffect(() => {
    const styledSet = hiddenNodesStyledSet.current;
    assignOrUpdateStyledNodeCollection(
      model,
      styledSet,
      DefaultNodeAppearance.Hidden
    );
    return () => {
      model.unassignStyledNodeCollection(styledSet);
    };
  }, [model]);

  // show only checked nodes
  useEffect(() => {
    if (!treeData.length) {
      return;
    }

    nodesVisibilityChanged(treeData, new Set(checkedKeys));
  }, [nodesVisibilityChanged, checkedKeys, treeData]);
}
