/*!
 * Copyright 2025 Cognite AS
 */
import { scrollToElementId } from '..';

import { CadTreeNode } from './cad-tree-node';

export function scrollToTreeIndex(container: HTMLElement | undefined, treeIndex: number): void {
  scrollToElementId(container, CadTreeNode.treeIndexToString(treeIndex));
}
