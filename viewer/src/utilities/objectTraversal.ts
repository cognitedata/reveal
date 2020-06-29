/*!
 * Copyright 2020 Cognite AS
 */

interface WithChildren<T> {
  readonly children: T[];
}

interface WithParent<T> {
  readonly parent?: T;
}

export function traverseDepthFirst<T extends WithChildren<T>>(root: T, visitor: (element: T) => boolean): void {
  if (!visitor(root)) {
    return;
  }

  for (let i = 0; i < root.children.length; i++) {
    traverseDepthFirst(root.children[i], visitor);
  }
}

export function traverseUpwards<T extends WithParent<T>>(node: T, callback: (element: T) => boolean) {
  if (!callback(node)) {
    return;
  }
  if (!node.parent) {
    return;
  }
  traverseUpwards(node.parent, callback);
}
