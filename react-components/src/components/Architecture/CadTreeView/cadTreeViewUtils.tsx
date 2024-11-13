/*!
 * Copyright 2024 Cognite AS
 */

import { type ITreeNode } from '../../../architecture';
import { CadTreeNode } from '../../../architecture/base/treeView/cadTreeView/CadTreeNode';

export function getId(node: ITreeNode): string {
  if (!(node instanceof CadTreeNode)) {
    return '';
  }
  return node.treeIndex.toString();
}

export function scrollToTreeIndex(container: HTMLElement | undefined, treeIndex: number): void {
  scrollToId(container, treeIndex.toString());
}

export function scrollToNode(container: HTMLElement | undefined, node: CadTreeNode): void {
  for (const ancestor of node.getAncestors()) {
    ancestor.isExpanded = true;
  }
  scrollToId(container, getId(node));
}

function scrollToId(container: HTMLElement | undefined, id: string): void {
  if (container === undefined) {
    return;
  }
  const element = document.getElementById(id);
  if (element === null) {
    return;
  }
  const height = container.offsetHeight;
  const top = element.offsetTop;
  const newTop = Math.max(0, top - height / 2);
  container.scroll({ top: newTop, behavior: 'smooth' });
}
