/*!
 * Copyright 2024 Cognite AS
 */

import { type TreeViewProps } from '../TreeView/TreeViewProps';
import { type CadTreeNode } from '../../../architecture/base/treeView/cadTreeView/CadTreeNode';

export type OnLoadedAction = (node: CadTreeNode, parent?: CadTreeNode) => void;

export type CadTreeViewProps = Omit<TreeViewProps, 'loadNodes' | 'root'> & {
  modelId: number;
  revisionId: number;
  onLoaded?: OnLoadedAction;
};
