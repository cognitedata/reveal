import { CadTreeNode } from '#test-utils/tree-view/nodes/cad-tree-node';
import { scrollToElementId } from './advanced-tree-view-utils';

export function scrollToTreeIndex(container: HTMLElement | undefined, treeIndex: number): void {
  scrollToElementId(container, CadTreeNode.treeIndexToString(treeIndex));
}
