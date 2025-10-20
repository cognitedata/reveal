import { scrollToElementId } from '../../src/advanced-tree-view';

import { CadTreeNode } from './cad-tree-node';

export function scrollToTreeIndex(container: HTMLElement | undefined, treeIndex: number): void {
  scrollToElementId(container, CadTreeNode.treeIndexToString(treeIndex));
}
