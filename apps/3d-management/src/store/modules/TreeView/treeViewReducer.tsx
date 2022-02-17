import React from 'react';
import { Actions, TreeViewState } from 'store/modules/TreeView/types';
import {
  addChildrenIntoTree,
  getNodeByTreeIndex,
  traverseTree,
  updateNodeById,
} from 'pages/RevisionDetails/components/TreeView/utils/treeFunctions';
import { TreeDataNode } from 'pages/RevisionDetails/components/TreeView/types';
import { LoadMore } from 'pages/RevisionDetails/components/TreeView/LoadMore';
import {
  getCheckedNodesAndStateOfUnknownChildren,
  subtreeHasTreeIndex,
} from 'store/modules/TreeView/treeViewUtils';

export function getInitialState(): TreeViewState {
  return {
    error: null,
    loading: false,
    revisionId: null,
    modelId: null,
    treeData: [],
    nodeUnknownChildrenAreHidden: {},
    checkedNodes: [0], // to avoid viewer be blocked by tree loading
    expandedNodes: [0],
    selectedNodes: [],
    loadingCursors: [],
  };
}

export default function treeDataReducer(
  prevState: TreeViewState = getInitialState(),
  action: Actions
): TreeViewState {
  switch (action.type) {
    case 'treeView/initialFetch': {
      return {
        ...getInitialState(),
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
        ...getCheckedNodesAndStateOfUnknownChildren(
          prevState,
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
      // we also should mark nodeUnknownChildrenAreHidden as true if every child got uncheked
      const nodeUnknownChildrenAreHidden = {
        ...prevState.nodeUnknownChildrenAreHidden,
      };
      const checkedNodes = action.payload;

      const nodeIsStrictlyUnchecked = (node: TreeDataNode): boolean => {
        return !checkedNodes.some((checkedKey) =>
          subtreeHasTreeIndex(node, checkedKey)
        );
      };

      traverseTree(prevState.treeData, (_, node) => {
        if (!('meta' in node)) {
          return false;
        }
        const dataNode = node as TreeDataNode;
        if (nodeIsStrictlyUnchecked(dataNode)) {
          traverseTree([node], (uncheckedKey, childNode) => {
            if ('meta' in childNode && childNode.meta.subtreeSize > 1) {
              nodeUnknownChildrenAreHidden[uncheckedKey] = true;
            }
            return true;
          });
          return false;
        }
        if (checkedNodes.includes(dataNode.key)) {
          Object.keys(nodeUnknownChildrenAreHidden).forEach(
            (prevHiddenKeyStr) => {
              if (subtreeHasTreeIndex(dataNode, +prevHiddenKeyStr)) {
                delete nodeUnknownChildrenAreHidden[prevHiddenKeyStr];
              }
            }
          );
          return false;
        }
        return true;
      });

      return {
        ...prevState,
        nodeUnknownChildrenAreHidden,
        checkedNodes,
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
        ...getCheckedNodesAndStateOfUnknownChildren(
          prevState,
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
        ...getCheckedNodesAndStateOfUnknownChildren(
          prevState,
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
        treeData: updateNodeById(prevState.treeData, action.payload.cursorKey, {
          title: <LoadMore />,
        }),
      };
    }
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

    case 'treeView/resetState': {
      return {
        ...getInitialState(),
      };
    }
  }

  return prevState;
}
