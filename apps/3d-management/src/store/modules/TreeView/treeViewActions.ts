import { ReduxThunk } from 'store';
import {
  Actions,
  InitialFetch,
  InitialFetchError,
  InitialFetchOk,
  LoadAncestorsError,
  LoadAncestorsOk,
  LoadChildren,
  LoadChildrenError,
  LoadChildrenOk,
  LoadSiblings,
  LoadSiblingsError,
  LoadSiblingsOk,
  NodeChecked,
  NodeExpanded,
  NodeSelected,
  TreeIndex,
} from 'store/modules/TreeView/types';
import {
  CustomDataNode,
  TreeDataNode,
} from 'pages/RevisionDetails/components/TreeView/types';
import {
  fetchAncestors,
  FetchNodesArgs,
  fetchRootTreeNodes,
  fetchTreeNodes,
} from 'store/modules/TreeView/treeViewDataProvider';
import {
  hasBranch,
  updateNodeById,
} from 'pages/RevisionDetails/components/TreeView/utils/treeFunctions';
import { node3dToTreeDataNode } from 'pages/RevisionDetails/components/TreeView/utils/converters';
import {
  getCheckedNodesAndStateOfUnknownChildren,
  getSafeDispatch,
} from 'store/modules/TreeView/treeViewUtils';

export const fetchInitialNodes = (
  modelId: number,
  revisionId: number
): ReduxThunk<InitialFetch | InitialFetchOk | InitialFetchError> => async (
  dispatch,
  getState
) => {
  dispatch({ type: 'treeView/initialFetch', payload: { modelId, revisionId } });
  const safeDispatch = getSafeDispatch(getState, dispatch, revisionId);

  try {
    const treeData: TreeDataNode[] = await fetchRootTreeNodes({
      modelId,
      revisionId,
    });

    safeDispatch({ type: 'treeView/initialFetchOk', payload: treeData });

    // in case user already clicked some node - expand it after initial loading is finished
    const { selectedNodes } = getState().treeView;

    if (selectedNodes.length) {
      const { treeIndex, nodeId } = selectedNodes[0];
      safeDispatch(
        expandArbitraryNode({
          treeIndex,
          nodeId,
        })
      );
    }
  } catch (error) {
    safeDispatch({ type: 'treeView/initialFetchError', payload: { error } });
  }
};

export const loadNodeChildren = (
  payload: FetchNodesArgs
): ReduxThunk<LoadChildren | LoadChildrenOk | LoadChildrenError> => async (
  dispatch,
  getState
) => {
  const { revisionId, modelId } = getState().treeView;
  if (!revisionId || !modelId) {
    return;
  }
  const safeDispatch = getSafeDispatch(getState, dispatch, revisionId);

  safeDispatch({ type: 'treeView/loadChildren' });
  try {
    const subtreeItems: CustomDataNode[] = await fetchTreeNodes({
      revisionId,
      modelId,
      ...payload,
    });

    safeDispatch({
      type: 'treeView/loadChildrenOk',
      payload: {
        subtreeItems,
        parentTreeIndex: payload.parent.treeIndex,
      },
    });
  } catch (error) {
    safeDispatch({
      type: 'treeView/loadChildrenError',
      payload: { error },
    });
  }
};

export const loadSiblings = (
  payload: Required<Omit<FetchNodesArgs, 'params'>> & { cursorKey: string }
): ReduxThunk<LoadSiblings | LoadSiblingsOk | LoadSiblingsError> => async (
  dispatch,
  getState
) => {
  const { treeView } = getState();
  const { revisionId, modelId } = treeView;
  if (!revisionId || !modelId) {
    return;
  }
  const safeDispatch = getSafeDispatch(getState, dispatch, revisionId);

  const { cursor, parent, cursorKey } = payload;

  if (treeView.loadingCursors.includes(cursor)) {
    return;
  }

  safeDispatch({ type: 'treeView/loadSiblings', payload: { cursorKey } });
  try {
    const subtreeItems: CustomDataNode[] = await fetchTreeNodes({
      ...payload,
      revisionId,
      modelId,
    });

    safeDispatch({
      type: 'treeView/loadSiblingsOk',
      payload: {
        cursorKey,
        subtreeItems,
        parent,
      },
    });
  } catch (error) {
    safeDispatch({
      type: 'treeView/loadSiblingsError',
      payload: { cursorKey, error },
    });
  }
};

/**
 * If needed, insert the node in the tree and make it visible (expand ancestors).
 */
export const expandArbitraryNode = (() => {
  let latestAncestorsRequester: number | null = null;
  return (payload: {
    nodeId: number;
    treeIndex: number;
    onSuccess?: () => void; // awkward way to wait until things are fetched
  }): ReduxThunk<LoadAncestorsOk | LoadAncestorsError | NodeExpanded> => {
    latestAncestorsRequester = payload.nodeId;
    return async (dispatch, getState) => {
      const {
        modelId,
        revisionId,
        treeData,
        checkedNodes,
        nodeUnknownChildrenAreHidden,
      } = getState().treeView;

      if (!revisionId || !modelId || !treeData.length) {
        // tree can be not loaded yet when fn is called, that's why treeData.length is checked
        return;
      }

      const safeDispatch = getSafeDispatch(getState, dispatch, revisionId);

      try {
        const nodes = await fetchAncestors({
          ...payload,
          revisionId,
          modelId,
        });
        if (
          !hasBranch(
            treeData,
            nodes.map((n) => n.treeIndex)
          )
        ) {
          let treeBranch: TreeDataNode[] = [
            {
              ...(treeData[0] as TreeDataNode),
              children: [...treeData[0].children!],
            },
          ];

          // prefetch instead of request it one after another in cycle below;
          const wholeHierarchyCursors: Record<
            TreeIndex,
            Promise<CustomDataNode>
          > = {};

          for (let i = 1; i < nodes.length; i++) {
            wholeHierarchyCursors[nodes[i - 1].treeIndex] = fetchTreeNodes({
              modelId,
              revisionId,
              parent: {
                treeIndex: nodes[i - 1].treeIndex,
                nodeId: nodes[i - 1].id,
              },
              params: {
                depth: 1, // all we need is cursor
                limit: 1,
              },
            }).then(([_, cursorOption]) => cursorOption);
          }

          let parent = treeBranch[0] as TreeDataNode;
          let newCheckedNodesAndStateOfUnknownChildren = {
            checkedNodes,
            nodeUnknownChildrenAreHidden,
          };

          // we don't check root since we always have it
          for (let i = 1; i < nodes.length; i++) {
            const parentChildren: CustomDataNode[] = parent.children || [];
            const foundChild = parentChildren.find(
              (n) => n.key === nodes[i].treeIndex
            ) as TreeDataNode | undefined;

            if (foundChild) {
              parent = foundChild;
              // eslint-disable-next-line no-continue
              continue;
            }

            const newChildren: CustomDataNode[] = node3dToTreeDataNode([
              nodes[i],
            ]);
            newCheckedNodesAndStateOfUnknownChildren = getCheckedNodesAndStateOfUnknownChildren(
              newCheckedNodesAndStateOfUnknownChildren,
              parent.key,
              newChildren
            );

            if (!parentChildren.find((n) => 'cursor' in n)) {
              const currentSubtreeSize = (parentChildren as TreeDataNode[]).reduce(
                (sum, child) => sum + child.meta.subtreeSize,
                nodes[i].subtreeSize + 1 // +1 is for parent
              );
              if (parent.meta.subtreeSize > currentSubtreeSize) {
                newChildren.push(
                  // eslint-disable-next-line no-await-in-loop
                  await wholeHierarchyCursors[nodes[i - 1].treeIndex]
                );
              }
            }

            const concatAfterCursor = (
              list: CustomDataNode[],
              list2: CustomDataNode[]
            ): CustomDataNode[] => {
              if (list && list.length && 'cursor' in list.slice(-1)[0]) {
                return list.slice(0, -1).concat(list2, list.slice(-1));
              }
              return list.concat(list2);
            };

            treeBranch = updateNodeById(treeBranch, parent.key, {
              children: concatAfterCursor(parentChildren, newChildren),
            });

            parent = newChildren[0] as TreeDataNode;
          }

          safeDispatch({
            type: 'treeView/loadAncestorsOk',
            payload: {
              treeData: treeBranch,
              ...newCheckedNodesAndStateOfUnknownChildren,
            },
          });
        }

        let { expandedNodes } = getState().treeView;
        expandedNodes = expandedNodes.concat(
          nodes
            .filter((node) => !expandedNodes.includes(node.treeIndex))
            .map((node) => node.treeIndex)
        );

        safeDispatch({
          type: 'treeView/nodeExpanded',
          payload: expandedNodes,
        });
      } catch (error) {
        safeDispatch({
          type: 'treeView/loadAncestorsError',
          payload: { error },
        });
      }

      if (latestAncestorsRequester === payload.nodeId && payload.onSuccess) {
        payload.onSuccess();
      }
    };
  };
})();

export const resetTreeViewState = () => (dispatch: (arg: Actions) => void) =>
  dispatch({ type: 'treeView/resetState' });

export const checkNodes = (payload: NodeChecked['payload']) => (
  dispatch: (arg: Actions) => void
) => dispatch({ type: 'treeView/nodeChecked', payload });

export const selectNodes = (payload: NodeSelected['payload']) => (
  dispatch
): ReduxThunk<NodeSelected> =>
  dispatch({ type: 'treeView/nodeSelected', payload });

export const expandNodes = (payload: NodeExpanded['payload']) => (
  dispatch: (arg: Actions) => void
) => dispatch({ type: 'treeView/nodeExpanded', payload });
