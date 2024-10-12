/*!
 * Copyright 2023 Cognite AS
 */

import { type IconName } from '../../../architecture/base/utilities/IconName';

export enum CheckBoxState {
  All,
  Some,
  None,
  Hidden
}

export type TreeNodeAction = (node: ITreeNode) => void;
export type IconColor = string | undefined;

export type ITreeNode = {
  get label(): string;
  get icon(): IconName | undefined; // undefined is no icon
  get iconColor(): IconColor; // undefined means default color, normally black
  get isSelected(): boolean;
  get checkBoxState(): CheckBoxState; // Return CheckBoxState.Hidden of no checkbox
  get isExpanded(): boolean;
  set isExpanded(value: boolean);
  get isEnabled(): boolean; // True for selectable and checkable
  get hasBoldLabel(): boolean;
  get isLoadingChildren(): boolean;
  set isLoadingChildren(value: boolean);
  get isLeaf(): boolean;

  getChildren: (forceLoading: boolean) => Generator<ITreeNode>;

  addTreeNodeListener: (listener: TreeNodeAction) => void;
  removeTreeNodeListener: (listener: TreeNodeAction) => void;
};
