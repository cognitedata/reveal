import React from 'react';
import {
  Actions,
  LoadChildren,
  LoadChildrenError,
  LoadChildrenOk,
  LoadSiblings,
  LoadSiblingsError,
  LoadSiblingsOk,
  LoadAncestorsError,
  LoadAncestorsOk,
  NodeChecked,
  NodeExpanded,
  NodeSelected,
  TreeViewState,
  InitialFetchError,
  InitialFetchOk,
  InitialFetch,
  TreeIndex,
} from 'src/store/modules/TreeView/types';
import {
  addChildrenIntoTree,
  getNodeByTreeIndex,
  hasBranch,
  updateNodeById,
} from 'src/pages/RevisionDetails/components/TreeView/utils/treeFunctions';
import {
  CustomDataNode,
  TreeDataNode,
} from 'src/pages/RevisionDetails/components/TreeView/types';
import { LoadMore } from 'src/pages/RevisionDetails/components/TreeView/LoadMore';
import {
  fetchAncestors,
  FetchNodesArgs,
  fetchRootTreeNodes,
  fetchTreeNodes,
} from 'src/store/modules/TreeView/treeViewDataProvider';
import { ReduxThunk, RootState } from 'src/store';
import { node3dToTreeDataNode } from 'src/pages/RevisionDetails/components/TreeView/utils/converters';

function getDefaultState(): TreeViewState {
  return {
    error: null,
    loading: false,
    revisionId: null,
    modelId: null,
    treeData: [],
    checkedNodes: [0], // to avoid viewer be blocked by tree loading
    expandedNodes: [0],
    selectedNodes: [],
    loadingCursors: [],
  };
}

// when we add nodes into the tree and their parent is checked, nodes must be checked too
function getNewCheckedNodes(
  prevCheckedNodes: Array<number>,
  parentTreeIndex: number,
  newChildren: Array<CustomDataNode> = []
) {
  if (prevCheckedNodes.includes(parentTreeIndex)) {
    const set = new Set(prevCheckedNodes);
    newChildren.forEach(({ key }) => {
      if (typeof key === 'number') {
        set.add(key);
      }
    });
    return Array.from(set);
  }
  return prevCheckedNodes;
}

export default function treeDataReducer(
  prevState: TreeViewState = getDefaultState(),
  action: Actions
): TreeViewState {
  switch (action.type) {
    case 'treeView/initialFetch': {
      return {
        ...getDefaultState(),
        revisionId: action.payload.revisionId,
        modelId: action.payload.modelId,
        loading: true,
        error: null,
      };
    }
    case 'treeView/initialFetchOk': {
      return {
        ...prevState,
        treeData: action.payload,
        checkedNodes: getNewCheckedNodes(
          prevState.checkedNodes,
          0,
          action.payload[0]!.children
        ),
        loading: false,
      };
    }
    case 'treeView/initialFetchError': {
      return {
        ...prevState,
        error: action.payload.error,
        loading: false,
      };
    }

    case 'treeView/nodeChecked': {
      return {
        ...prevState,
        checkedNodes: action.payload,
      };
    }
    case 'treeView/nodeSelected': {
      return {
        ...prevState,
        selectedNodes: action.payload,
      };
    }
    case 'treeView/nodeExpanded': {
      return {
        ...prevState,
        expandedNodes: action.payload,
      };
    }

    case 'treeView/loadChildren': {
      return {
        ...prevState,
        error: null,
      };
    }
    case 'treeView/loadChildrenOk': {
      return {
        ...prevState,
        treeData: addChildrenIntoTree(
          prevState.treeData,
          action.payload.parentTreeIndex,
          action.payload.subtreeItems
        ) as TreeDataNode[],
        checkedNodes: getNewCheckedNodes(
          prevState.checkedNodes,
          action.payload.parentTreeIndex,
          action.payload.subtreeItems
        ),
      };
    }
    case 'treeView/loadChildrenError': {
      return {
        ...prevState,
        error: action.payload.error,
      };
    }

    case 'treeView/loadSiblings': {
      return {
        ...prevState,
        loadingCursors: prevState.loadingCursors.concat(
          action.payload.cursorKey
        ),
        treeData: updateNodeById(prevState.treeData, action.payload.cursorKey, {
          title: (
            <LoadMore onClick={(e) => e.preventDefault()}>Loading...</LoadMore>
          ),
        }),
      };
    }
    case 'treeView/loadSiblingsOk': {
      const parentNode = getNodeByTreeIndex(
        prevState.treeData,
        action.payload.parent.treeIndex
      );
      if (!parentNode || !parentNode.children || !parentNode.children.length) {
        return prevState;
      }

      const parentHasCursor = 'cursor' in parentNode.children.slice(-1)[0];

      const parentChildrenWithoutCursor = parentHasCursor
        ? parentNode.children.slice(0, -1)
        : parentNode.children;

      const newChildren = addChildrenIntoTree(
        parentChildrenWithoutCursor,
        undefined, // just concating instead of inserting into child
        action.payload.subtreeItems
      );

      return {
        ...prevState,
        loadingCursors: prevState.loadingCursors.filter(
          (cursor) => cursor !== action.payload.cursorKey
        ),
        treeData: updateNodeById<TreeDataNode>(
          prevState.treeData,
          parentNode.key,
          {
            children: newChildren,
          }
        ),
        checkedNodes: getNewCheckedNodes(
          prevState.checkedNodes,
          parentNode.key,
          action.payload.subtreeItems
        ),
      };
    }
    case 'treeView/loadSiblingsError': {
      return {
        ...prevState,
        error: action.payload.error,
        loadingCursors: prevState.loadingCursors.filter(
          (cursor) => cursor !== action.payload.cursorKey
        ),
        treeData: updateNodeById<TreeDataNode, CustomDataNode>(
          prevState.treeData,
          action.payload.cursorKey,
          {
            title: <LoadMore />,
          }
        ),
      };
    }
    // case 'treeView/loadAncestors': {
    //   return prevState; // nothing is going on here
    // }
    case 'treeView/loadAncestorsOk': {
      return {
        ...prevState,
        treeData: action.payload.treeData,
        checkedNodes: action.payload.checkedNodes,
      };
    }
    case 'treeView/loadAncestorsError': {
      return {
        ...prevState,
        error: action.payload.error,
      };
    }
  }

  return prevState;
}

// make sure we update state for the currently viewed tree, not some that was open before it
function getSafeDispatch(
  getState: () => RootState,
  dispatch: Function,
  revisionId: number
) {
  return (...args: any[]) => {
    if (getState().treeView.revisionId === revisionId) {
      dispatch(...args);
    }
  };
}

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
        expandNodeByTreeIndex({
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

export const expandNodeByTreeIndex = (() => {
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
      } = getState().treeView;

      if (!revisionId || !modelId || !treeData.length) {
        // tree can be not loaded yet when fn is called, that's why treeData.length is checked
        return;
      }

      const safeDispatch = getSafeDispatch(getState, dispatch, revisionId);

      // dispatch({ type: 'treeView/loadAncestors', payload: { treeIndex } })

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
          let newCheckedNodes = checkedNodes;

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
            newCheckedNodes = getNewCheckedNodes(
              newCheckedNodes,
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

            treeBranch = updateNodeById<TreeDataNode>(treeBranch, parent.key, {
              children: concatAfterCursor(parentChildren, newChildren),
            });

            parent = newChildren[0] as TreeDataNode;
          }

          safeDispatch({
            type: 'treeView/loadAncestorsOk',
            payload: { treeData: treeBranch, checkedNodes: newCheckedNodes },
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
