/*!
 * Copyright 2024 Cognite AS
 */

import { type IconName } from '../utilities/IconName';
import {
  type TreeNodeAction,
  type CheckBoxState,
  type IconColor,
  type LoadNodesAction
} from './types';

export type ITreeNode = {
  // Appearance
  get isParent(): boolean; // Returns true if this node has children (loaded or not loaded)
  get label(): string; // Returns the label
  get hasBoldLabel(): boolean; // Returns true if the label should be rendered in bold font
  get icon(): IconName | undefined; // Returns the icon. undefined is no icon
  get iconColor(): IconColor; // undefined means default color, normally black
  get isSelected(): boolean; // Returns true if it is selected
  get isEnabled(): boolean; // True for selectable or checkable
  get isExpanded(): boolean; // Returns true if expanded
  set isExpanded(value: boolean);
  get checkBoxState(): CheckBoxState; // Return CheckBoxState.Hidden of no checkbox

  // For lazy loading
  get needLoadSiblings(): boolean; // Returns true if this node has more siblings to be loaded
  get isLoadingChildren(): boolean; // Returns true if this node is loading children now
  get isLoadingSiblings(): boolean; // Returns true if this node is loading siblings now

  // Get the children of this node. If the children are not loaded,
  // the loadNodes function will be called.
  getChildren: (loadNodes?: LoadNodesAction) => Generator<ITreeNode>;

  // Load siblings. The siblings will be inserted just after the node.
  loadSiblings: (loadNodes: LoadNodesAction) => Promise<void>;

  // Add or remove listener functions for updating.
  addTreeNodeListener: (listener: TreeNodeAction) => void;
  removeTreeNodeListener: (listener: TreeNodeAction) => void;
};
