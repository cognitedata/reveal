import React, { useCallback, useEffect } from 'react';

import {
  TreeIndexNodeCollection,
  CogniteCadModel,
  DefaultNodeAppearance,
  IndexSet,
  NumericRange,
} from '@cognite/reveal';
import { TreeDataNode } from 'pages/RevisionDetails/components/TreeView/types';
import { traverseTree } from 'pages/RevisionDetails/components/TreeView/utils/treeFunctions';
import { assignOrUpdateStyledNodeCollection } from 'utils/sdk/3dNodeStylingUtils';

type Args = {
  model: CogniteCadModel;
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
      hiddenNodesSet.current.clear();
      // Add everything thats checked
      traverseTree(newTreeData, (key, node) => {
        if (!node.isTreeDataNode) {
          return false;
        }
        if (
          node.isTreeDataNode &&
          typeof key === 'number' &&
          checkedKeysSet.has(key)
        ) {
          hiddenNodesSet.current.addRange(
            new NumericRange(node.meta.treeIndex, node.meta.subtreeSize)
          );
          // Already added subtree, no need to process any deeper
          return false;
        }
        // Process children
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
      DefaultNodeAppearance.Default
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
