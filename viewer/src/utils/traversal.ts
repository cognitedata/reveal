/*!
 * Copyright 2019 Cognite AS
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

  if (root.children) {
    for (const child of root.children) {
      traverseDepthFirst(child, visitor);
    }
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
