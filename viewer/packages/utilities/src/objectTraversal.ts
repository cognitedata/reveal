/*!
 * Copyright 2021 Cognite AS
 */

interface WithChildren<T> {
  readonly children: T[];
}

export function traverseDepthFirst<T extends WithChildren<T>>(root: T, visitor: (element: T) => boolean): void {
  if (!visitor(root)) {
    return;
  }

  for (let i = 0; i < root.children.length; i++) {
    traverseDepthFirst(root.children[i], visitor);
  }
}
