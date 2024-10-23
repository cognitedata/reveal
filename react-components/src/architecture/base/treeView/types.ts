/*!
 * Copyright 2023 Cognite AS
 */

import { type ITreeNode } from './ITreeNode';

export enum CheckBoxState {
  All,
  Some,
  None,
  Hidden
}

export type TreeNodeAction = (node: ITreeNode) => void;

export type LoadNodesAction = (
  node: ITreeNode,
  loadChildren: boolean
) => Promise<ITreeNode[] | undefined>;

export type IconColor = string | undefined;
