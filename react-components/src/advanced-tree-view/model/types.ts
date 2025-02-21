/*!
 * Copyright 2025 Cognite AS
 */
import { type TreeNodeType } from './tree-node-type';

export type IconName = string | undefined;

export type IconColor = string | undefined;

export enum CheckboxState {
  All,
  Some,
  None
}

export type TreeNodeAction = (node: TreeNodeType) => void;

/**
 * This defines a type alias LoadNodesAction for a function. This type is likely used to represent asynchronous actions for loading nodes in
 * the tree view.
 * @param node - The parent or the sibling node to load siblings for.
 * @param boolean - True of children should be loaded, false if the sibling
 * @return A Promise that resolves to an array of TreeNodeType objects or undefined.
 * @beta
 */

export type OnNodeLoadedAction = (child: TreeNodeType, parent?: TreeNodeType) => void;
