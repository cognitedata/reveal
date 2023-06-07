import { RootState } from 'store';
import {
  CustomDataNode,
  TreeDataNode,
} from 'pages/RevisionDetails/components/TreeView/types';

// make sure we update state for the currently viewed tree, not some that was open before it
export function getSafeDispatch(
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

type CheckedNodesAndStateOfUnknownChildren = {
  checkedNodes: Array<number>;
  nodeUnknownChildrenAreHidden: Record<number, boolean>;
};

export function getCheckedNodesAndStateOfUnknownChildren(
  prevState: CheckedNodesAndStateOfUnknownChildren,
  parentTreeIndex: number,
  newChildren: Array<CustomDataNode> = []
): CheckedNodesAndStateOfUnknownChildren {
  // parent unchecked and newChildren are unchecked too
  if (
    !prevState.checkedNodes.includes(parentTreeIndex) &&
    prevState.nodeUnknownChildrenAreHidden[parentTreeIndex]
  ) {
    const nodeUnknownChildrenAreHidden = {
      ...prevState.nodeUnknownChildrenAreHidden,
    };
    newChildren.forEach((newNode) => {
      if ('meta' in newNode && newNode.meta.subtreeSize > 1) {
        nodeUnknownChildrenAreHidden[newNode.key] = true;
      }
    });
    return {
      checkedNodes: prevState.checkedNodes,
      nodeUnknownChildrenAreHidden,
    };
  }

  const set = new Set(prevState.checkedNodes);
  newChildren.forEach(({ key }) => {
    if (typeof key === 'number') {
      set.add(key);
    }
  });

  return {
    checkedNodes: Array.from(set),
    nodeUnknownChildrenAreHidden: prevState.nodeUnknownChildrenAreHidden,
  };
}

/**
 * Checks if treeIndex belongs to the subtree
 * @param subtree
 * @param treeIndex
 */
export function subtreeHasTreeIndex(
  subtree: TreeDataNode,
  treeIndex: number
): boolean {
  return (
    treeIndex >= subtree.key &&
    treeIndex < subtree.key + subtree.meta.subtreeSize
  );
}
