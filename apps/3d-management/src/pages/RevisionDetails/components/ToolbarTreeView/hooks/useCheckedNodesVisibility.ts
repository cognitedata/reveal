import React, { useCallback, useEffect } from 'react';

import debounce from 'lodash/debounce';
import { Cognite3DModel } from '@cognite/reveal';
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

            if (
              !hiddenTreeRanges.find(
                ([start, end]) => key >= start && key < end
              )
            ) {
              const allKnownChildrenAreHidden = ![
                ...checkedKeysSet.values(),
              ].some((checkedIndex) => subtreeHasTreeIndex(node, checkedIndex));

              const hadCheckedChildBefore = [
                ...prevCheckedKeysRef.current!.values(),
              ].some((previouslyCheckedKey) =>
                subtreeHasTreeIndex(node, previouslyCheckedKey)
              );

              // should be hidden with applyToChildren=true
              if (
                node.meta.subtreeSize > 1 &&
                (!node.children || allKnownChildrenAreHidden)
              ) {
                if (hadCheckedChildBefore) {
                  nodesHidingArgs.push([key, true]);
                }
                hiddenTreeRanges.push([key, key + node.meta.subtreeSize]);
                return false;
              }

              if (prevCheckedKeysRef.current!.has(key)) {
                nodesHidingArgs.push([key, false]);
              }
              hiddenTreeRanges.push([key, key + 1]);
            }

            // must keep looking for every visible children
            return true;
          });

          await Promise.all<any>(
            nodesHidingArgs.map(([treeIndex, applyToChildren]) => {
              if (treeIndex === 0 && applyToChildren) {
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
              if (treeIndex === 0 && applyToChildren) {
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
