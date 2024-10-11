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

export type ITreeNode = {
  get label(): string;
  get icon(): IconName | undefined; // undefined is no icon
  get isSelected(): boolean;
  get checkedBoxState(): CheckBoxState; // Return Hidden of no checkbox
  get isExpanded(): boolean;
  set isExpanded(value: boolean);
  get isEnabled(): boolean; // True for selectable and checkable
  get hasBoldLabel(): boolean;
  get isLeaf(): boolean;

  getVisibleChildren: () => Generator<ITreeNode>;
};
