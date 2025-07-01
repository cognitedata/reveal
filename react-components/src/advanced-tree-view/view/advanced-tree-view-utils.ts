import { TreeNode } from '../model/tree-node';
import { type TreeNodeType } from '../model/tree-node-type';

export function scrollToNode(container: HTMLElement | undefined, node: TreeNodeType): void {
  if (node instanceof TreeNode) {
    node.expandAllAncestors();
  }
  scrollToElementId(container, node.id);
}

export function scrollToElementId(container: HTMLElement | undefined, id: string): void {
  if (container === undefined) {
    return;
  }
  const element = document.getElementById(id);
  if (element === null) {
    console.error('Element is not found', id);
    return;
  }
  const height = container.offsetHeight;
  const top = element.offsetTop;
  const newTop = Math.max(0, top - height / 2);
  container.scroll({ top: newTop, behavior: 'smooth' });
}

export function scrollToFirst(
  container: HTMLElement | undefined,
  root: TreeNodeType | undefined
): void {
  if (container === undefined) {
    return;
  }
  if (root === undefined) {
    return;
  }
  scrollToElementId(container, root.id);
}

export function scrollToLast(
  container: HTMLElement | undefined,
  root: TreeNodeType | undefined
): void {
  if (container === undefined) {
    return;
  }
  if (!(root instanceof TreeNode)) {
    return;
  }
  let lastNode = root;
  for (const node of root.getThisAndDescendants()) {
    lastNode = node;
  }
  scrollToNode(container, lastNode);
}
