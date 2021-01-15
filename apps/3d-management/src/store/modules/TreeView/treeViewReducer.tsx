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
  TreeLoadMoreNode,
} from 'src/pages/RevisionDetails/components/TreeView/types';
import { LoadMore } from 'src/pages/RevisionDetails/components/TreeView/LoadMore';
import {
  fetchAncestors,
  FetchNodesArgs,
  fetchRootTreeNodes,
  fetchTreeNodes,
  RevisionId,
} from 'src/store/modules/TreeView/treeViewDataProvider';
import { ReduxThunk } from 'src/store';
import { node3dToCustomDataNode } from 'src/pages/RevisionDetails/components/TreeView/utils/node3dToCustomDataNode';

function getDefaultState(): TreeViewState {
  return {
    error: null,
    loading: false,
    treeData: [],
    checkedNodes: [0], // to avoid viewer be blocked by tree loading
    expandedNodes: [0],
    selectedNodes: [],
    loadingCursors: [],
  };
}

export default function treeDataReducer(
  prevState: TreeViewState = getDefaultState(),
  action: Actions
): TreeViewState {
  switch (action.type) {
    case 'treeView/initialFetch': {
      return {
        ...getDefaultState(),
        loading: true,
        error: null,
      };
    }
    case 'treeView/initialFetchOk': {
      return {
        ...prevState,
        treeData: action.payload,
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
        treeData: addChildrenIntoTree<CustomDataNode>(
          prevState.treeData,
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
        treeData: updateNodeById<CustomDataNode>(
          prevState.treeData,
          parentNode.key,
          {
            children: newChildren,
          }
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
        treeData: updateNodeById<CustomDataNode, TreeLoadMoreNode>(
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
      // would be also nice to handle edge-case when ALL nodes are already in the tree (worth to refetch then)
      return {
        ...prevState,
        treeData: action.payload.treeData,
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

export const fetchInitialNodes = (
  modelId: number,
  revisionId: number
): ReduxThunk<InitialFetch | InitialFetchOk | InitialFetchError> => async (
  dispatch,
  getState
) => {
  dispatch({ type: 'treeView/initialFetch' });

  try {
    const treeData: TreeDataNode[] = await fetchRootTreeNodes({
      modelId,
      revisionId,
    });

    dispatch({ type: 'treeView/initialFetchOk', payload: treeData });

    // in case user already clicked some node - expand it after initial loading is finished
    const { selectedNodes } = getState().treeView;

    if (selectedNodes.length) {
      const { treeIndex, nodeId } = selectedNodes[0];
      dispatch(
        expandNodeByTreeIndex({
          treeIndex,
          nodeId,
          modelId,
          revisionId,
        })
      );
    }
  } catch (error) {
    dispatch({ type: 'treeView/initialFetchError', payload: { error } });
  }
};

export const loadNodeChildren = (
  payload: FetchNodesArgs
): ReduxThunk<LoadChildren | LoadChildrenOk | LoadChildrenError> => async (
  dispatch
) => {
  dispatch({ type: 'treeView/loadChildren' });
  try {
    const subtreeItems: CustomDataNode[] = await fetchTreeNodes(payload);

    dispatch({
      type: 'treeView/loadChildrenOk',
      payload: {
        subtreeItems,
        parentTreeIndex: payload.parent.treeIndex,
      },
    });
  } catch (error) {
    dispatch({
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
  const { cursor, parent, cursorKey } = payload;
  const { treeView } = getState();
  if (treeView.loadingCursors.includes(cursor)) {
    return;
  }

  dispatch({ type: 'treeView/loadSiblings', payload: { cursorKey } });
  try {
    const subtreeItems: CustomDataNode[] = await fetchTreeNodes(payload);

    dispatch({
      type: 'treeView/loadSiblingsOk',
      payload: {
        cursorKey,
        subtreeItems,
        parent,
      },
    });
  } catch (error) {
    dispatch({
      type: 'treeView/loadSiblingsError',
      payload: { cursorKey, error },
    });
  }
};

export const expandNodeByTreeIndex = (() => {
  let latestAncestorsRequester: number | null = null;
  return (
    payload: RevisionId & {
      nodeId: number;
      treeIndex: number;
      onSuccess?: () => void; // awkward way to wait until things are fetched
    }
  ): ReduxThunk<LoadAncestorsOk | LoadAncestorsError | NodeExpanded> => {
    latestAncestorsRequester = payload.nodeId;
    return async (dispatch, getState) => {
      // dispatch({ type: 'treeView/loadAncestors', payload: { treeIndex } })
      const { treeData } = getState().treeView;
      if (!treeData.length) {
        return;
      }
      try {
        const nodes = await fetchAncestors(payload);
        if (
          !hasBranch(
            treeData,
            nodes.map((n) => n.treeIndex)
          )
        ) {
          let treeBranch: CustomDataNode[] = [
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
              modelId: payload.modelId,
              revisionId: payload.revisionId,
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

            const newChildren: CustomDataNode[] = node3dToCustomDataNode([
              nodes[i],
            ]);

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

            treeBranch = updateNodeById<CustomDataNode>(
              treeBranch,
              parent.key,
              {
                children: concatAfterCursor(parentChildren, newChildren),
              }
            );

            parent = newChildren[0] as TreeDataNode;
          }

          dispatch({
            type: 'treeView/loadAncestorsOk',
            payload: { treeData: treeBranch },
          });
        }

        let { expandedNodes } = getState().treeView;
        expandedNodes = expandedNodes.concat(
          nodes
            .filter((node) => !expandedNodes.includes(node.treeIndex))
            .map((node) => node.treeIndex)
        );

        dispatch({
          type: 'treeView/nodeExpanded',
          payload: expandedNodes,
        });
      } catch (error) {
        dispatch({ type: 'treeView/loadAncestorsError', payload: { error } });
      }

      if (latestAncestorsRequester === payload.nodeId && payload.onSuccess) {
        payload.onSuccess();
      }
    };
  };
})();

export const checkNodes = (payload: NodeChecked['payload']) => (dispatch) =>
  dispatch({ type: 'treeView/nodeChecked', payload });

export const selectNodes = (payload: NodeSelected['payload']) => (
  dispatch
): ReduxThunk<NodeSelected> =>
  dispatch({ type: 'treeView/nodeSelected', payload });

export const expandNodes = (payload: NodeExpanded['payload']) => (dispatch) =>
  dispatch({ type: 'treeView/nodeExpanded', payload });
