/*!
 * Copyright 2024 Cognite AS
 */

import { type TreeViewProps } from '../TreeView/TreeViewProps';
import { type CadTreeNode } from '../../../architecture/base/treeNodes/cadTreeNodes/CadTreeNode';
import { type OnLoadedAction } from '../../../architecture/base/treeNodes/cadTreeNodes/types';

export type CadTreeViewProps = Omit<TreeViewProps, 'loadNodes' | 'root' | 'getId'> & {
  modelId: number;
  revisionId: number;
  onLoaded?: OnLoadedAction;
  onRootSet?: (root: CadTreeNode) => void;
};

// NOTE: onLoaded() is called when node is loaded, but before is is added/inserted into the tree.
// Here you can set the default `CheckBoxState `and other initialization. Typically:
//
// onLoaded(node: CadTreeNode, parent?: CadTreeNode): void
// {
//   if (parent === undefined) {
//     return; // No parent if root, you have to figure out what to do here
//   }
//   node.checkBoxState = parent.checkBoxState;
//   if (node.checkBoxState == CheckBoxState.All) {
//     // Set the node visible in the viewer
//   }
// }
