import React, { useCallback, useEffect } from 'react';

import debounce from 'lodash/debounce';
import { Cognite3DModel } from '@cognite/reveal';
import { TreeDataNode } from 'src/pages/RevisionDetails/components/TreeView/types';
import { traverseTree } from 'src/pages/RevisionDetails/components/TreeView/utils/treeFunctions';

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

  // that's to avoid race state D3M-32
  const lastOperation = React.useRef<Promise<any>>(Promise.resolve());

  const nodesVisibilityChanged = useCallback(
    debounce(
      async (newTreeData: typeof treeData, checkedKeysSet: Set<number>) => {
        await lastOperation.current;

        const updateNodesVisibility = async () => {
          const nodesShowingArgs: [number, boolean][] = [];
          const nodesHidingArgs: [number, boolean][] = [];

          // use to avoid calling hide/show node multiple times
          const hiddenTreeRanges: Array<[number, number]> = [];

          // for the initial render when prevSet is null
          // we simply hide all nodes and show what's need to be shown
          // because we have no idea about the actual model visibility state
          if (!prevCheckedKeysRef.current) {
            hiddenTreeRanges.push([0, newTreeData[0].meta.subtreeSize]);
            nodesHidingArgs.push([0, true]);
            prevCheckedKeysRef.current = new Set();
          }

          traverseTree(newTreeData, (key, node) => {
            if (!('meta' in node) || typeof key !== 'number') {
              return false;
            }

            if (checkedKeysSet.has(key)) {
              // we need to reapply styling only if node is about to be hidden
              if (
                !prevCheckedKeysRef.current!.has(key) ||
                hiddenTreeRanges.find(
                  ([start, end]) => key >= start && key < end
                )
              ) {
                nodesShowingArgs.push([key, node.meta.subtreeSize > 1]);
              }

              // when node is checked, all its children checked too, so stop traversing
              return false;
            }

            if (prevCheckedKeysRef.current!.has(key)) {
              if (
                !hiddenTreeRanges.find(
                  ([start, end]) => key >= start && key < end
                )
              ) {
                nodesHidingArgs.push([key, node.meta.subtreeSize > 1]);
                hiddenTreeRanges.push([key, key + node.meta.subtreeSize]);
              }
            }

            // must keep looking for every visible children
            return true;
          });

          await Promise.all<any>(
            nodesHidingArgs.map(([treeIndex, applyToChildren]) => {
              if (treeIndex === 0) {
                return model.hideAllNodes();
              }
              return model.hideNodeByTreeIndex(
                treeIndex,
                undefined,
                applyToChildren
              );
            })
          );
          await Promise.all<any>(
            nodesShowingArgs.map(([treeIndex, applyToChildren]) => {
              if (treeIndex === 0) {
                return model.showAllNodes();
              }
              return model.showNodeByTreeIndex(treeIndex, applyToChildren);
            })
          );
        };

        lastOperation.current = lastOperation.current.then(async () => {
          await updateNodesVisibility();
          prevCheckedKeysRef.current = checkedKeysSet;
        });
      },
      250
    ), // delayed to give a chance to treeView to finish checkbox redraw
    [model]
  );

  // show only checked nodes
  useEffect(() => {
    if (!treeData.length) {
      return;
    }
    nodesVisibilityChanged(treeData, new Set(checkedKeys));
  }, [nodesVisibilityChanged, checkedKeys, treeData]);
}
