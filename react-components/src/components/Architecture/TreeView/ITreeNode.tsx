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
export type LoadNodesAction = (node: ITreeNode, loadChildren: boolean) => ITreeNode[] | undefined;
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

  get needLoadChildren(): boolean;
  set needLoadChildren(value: boolean);
  get needLoadSiblings(): boolean;
  set needLoadSiblings(value: boolean);
  get isLoadingChildren(): boolean;
  set isLoadingChildren(value: boolean);
  get isLoadingSiblings(): boolean;
  set isLoadingSiblings(value: boolean);

  get isLeaf(): boolean;

  getChildren: (loadNodes?: LoadNodesAction) => Generator<ITreeNode>;

  loadSiblings: (loadNodes: LoadNodesAction) => Promise<void>;
  addTreeNodeListener: (listener: TreeNodeAction) => void;
  removeTreeNodeListener: (listener: TreeNodeAction) => void;
};
