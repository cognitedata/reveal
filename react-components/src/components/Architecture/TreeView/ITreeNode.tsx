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
export type LoadChildrenAction = (node: ITreeNode) => ITreeNode[] | undefined;
export type IconColor = string | undefined;

export type ITreeNode = {
  get numberOfChildren(): number;
  get label(): string;
  get hasBoldLabel(): boolean;
  get icon(): IconName | undefined; // undefined is no icon
  get iconColor(): IconColor; // undefined means default color, normally black
  get isSelected(): boolean;
  get isEnabled(): boolean; // True for selectable and checkable
  get isExpanded(): boolean;
  set isExpanded(value: boolean);
  get checkBoxState(): CheckBoxState; // Return CheckBoxState.Hidden of no checkbox
  get isLoadingChildren(): boolean;
  set isLoadingChildren(value: boolean);
  get needLoadMoreChildren(): boolean;
  set needLoadMoreChildren(value: boolean);
  get isLeaf(): boolean;

  getChildren: (loadChildren?: LoadChildrenAction) => Generator<ITreeNode>;

  addTreeNodeListener: (listener: TreeNodeAction) => void;
  removeTreeNodeListener: (listener: TreeNodeAction) => void;
};
