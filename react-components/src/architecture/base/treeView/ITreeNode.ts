/*!
 * Copyright 2023 Cognite AS
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
  get label(): string;
  get hasBoldLabel(): boolean;
  get icon(): IconName | undefined; // undefined is no icon
  get iconColor(): IconColor; // undefined means default color, normally black
  get isSelected(): boolean;
  get isEnabled(): boolean; // True for selectable and checkable
  get isExpanded(): boolean;
  set isExpanded(value: boolean);
  get checkBoxState(): CheckBoxState; // Return CheckBoxState.Hidden of no checkbox

  // For lazy loading
  get needLoadSiblings(): boolean;
  get isLoadingChildren(): boolean;
  get isLoadingSiblings(): boolean;
  loadSiblings: (loadNodes: LoadNodesAction) => Promise<void>;

  // Parent-children
  get isParent(): boolean;
  getChildren: (loadNodes?: LoadNodesAction) => Generator<ITreeNode>;

  // For updating
  addTreeNodeListener: (listener: TreeNodeAction) => void;
  removeTreeNodeListener: (listener: TreeNodeAction) => void;
};
