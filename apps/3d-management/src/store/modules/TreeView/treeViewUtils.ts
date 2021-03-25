import { RootState } from 'src/store';
import { CustomDataNode } from 'src/pages/RevisionDetails/components/TreeView/types';

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

// when we add nodes into the tree and their parent is checked, nodes must be checked too
export function getNewCheckedNodes(
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
