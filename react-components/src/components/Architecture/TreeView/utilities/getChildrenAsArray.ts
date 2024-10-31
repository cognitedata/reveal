/*!
 * Copyright 2024 Cognite AS
 */

import { type ITreeNode } from '../../../../architecture/base/treeView/ITreeNode';
import { type LoadNodesAction } from '../../../../architecture/base/treeView/types';

// ==================================================
// FUNCTIONS
// ==================================================

export function getChildrenAsArray(
  node: ITreeNode,
  loadNodes: LoadNodesAction | undefined,
  useExpanded = true
): ITreeNode[] | undefined {
  if (useExpanded && !node.isExpanded) {
    return undefined;
  }
  if (node.getChildren(loadNodes).next().value === undefined) {
    return undefined;
  }
  return Array.from(node.getChildren(loadNodes));
}
