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

export type IconColor = string | undefined;

export type TreeNodeAction = (node: ITreeNode) => void;

/**
 * This defines a type alias LoadNodesAction for a function. This type is likely used to represent asynchronous actions for loading nodes in
 * the tree view.
 * @param node - The parent or the sibling node to load siblings for.
 * @param boolean - True of children should be loaded, false if the sibling
 * @return A Promise that resolves to an array of ITreeNode objects or undefined.
 * @beta
 */

export type LoadNodesAction = (
  node: ITreeNode,
  loadChildren: boolean
) => Promise<ITreeNode[] | undefined>;
