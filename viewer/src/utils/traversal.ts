/*!
 * Copyright 2019 Cognite AS
 */

interface WithChildren<T> {
  readonly children: T[];
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
