import React, { useCallback, useEffect } from 'react';

import {
  ByTreeIndexNodeSet,
  Cognite3DModel,
  DefaultNodeAppearance,
  IndexSet,
  NumericRange,
} from '@cognite/reveal';
import { TreeDataNode } from 'src/pages/RevisionDetails/components/TreeView/types';
import { traverseTree } from 'src/pages/RevisionDetails/components/TreeView/utils/treeFunctions';
import { subtreeHasTreeIndex } from 'src/store/modules/TreeView/treeViewUtils';

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
  const prevCheckedKeysRef = React.useRef<Set<number> | null>(null);

  const hiddenNodesSet = React.useRef(new IndexSet());
  const hiddenNodesStyledSet = React.useRef(
    new ByTreeIndexNodeSet(hiddenNodesSet.current)
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const nodesVisibilityChanged = useCallback(
    (newTreeData: typeof treeData, checkedKeysSet: Set<number>) => {
      // use to avoid calling hide/show node multiple times
      const hiddenTreeRanges: Array<[number, number]> = [];

      traverseTree(newTreeData, (key, node) => {
        if (typeof key !== 'number') {
          return false;
        }

        if (checkedKeysSet.has(key)) {
          // we need to reapply styling only if node is about to be hidden
          if (
            !prevCheckedKeysRef.current!.has(key) ||
            hiddenTreeRanges.find(([start, end]) => key >= start && key < end)
          ) {
            hiddenNodesSet.current.removeRange(
              new NumericRange(key, node.meta.subtreeSize)
            );
          }

          // when node is checked, all its children checked too, so stop traversing
          return false;
        }

        if (
          !hiddenTreeRanges.find(([start, end]) => key >= start && key < end)
        ) {
          const allKnownChildrenAreHidden = ![
            ...checkedKeysSet.values(),
          ].some((checkedIndex) =>
            subtreeHasTreeIndex(node as TreeDataNode, checkedIndex)
          );
          const hadCheckedChildBefore = [
            ...prevCheckedKeysRef.current!.values(),
          ].some((previouslyCheckedKey) =>
            subtreeHasTreeIndex(node as TreeDataNode, previouslyCheckedKey)
          );

          // should be hidden with applyToChildren=true
          if (
            node.meta.subtreeSize > 1 &&
            (!node.children || allKnownChildrenAreHidden)
          ) {
            if (hadCheckedChildBefore) {
              hiddenNodesSet.current.addRange(
                new NumericRange(key, node.meta.subtreeSize)
              );
            }
            hiddenTreeRanges.push([key, key + node.meta.subtreeSize]);
            return false;
          }

          if (prevCheckedKeysRef.current!.has(key)) {
            hiddenNodesSet.current.add(key);
          }
          hiddenTreeRanges.push([key, key + 1]);
        }

        // must keep looking for every visible children
        return true;
      });

      hiddenNodesStyledSet.current.updateSet(hiddenNodesSet.current);
      prevCheckedKeysRef.current = checkedKeysSet;
    },
    []
  );

  useEffect(() => {
    const styledSet = hiddenNodesStyledSet.current;
    model.addStyledNodeSet(styledSet, DefaultNodeAppearance.Hidden);
    return () => {
      model.removeStyledNodeSet(styledSet);
    };
  }, [model]);

  // show only checked nodes
  useEffect(() => {
    if (!treeData.length) {
      return;
    }

    // while this hook is the only source of visibility updates,
    // we can assume we know that before everything was visible
    if (!prevCheckedKeysRef.current) {
      prevCheckedKeysRef.current = new Set<number>();
      traverseTree(treeData, (key) => {
        if (typeof key === 'number') {
          prevCheckedKeysRef.current!.add(key);
        }
      });
    }

    nodesVisibilityChanged(treeData, new Set(checkedKeys));
  }, [nodesVisibilityChanged, checkedKeys, treeData]);
}
