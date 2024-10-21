/*!
 * Copyright 2023 Cognite AS
 */

import { type TreeNodeAction, type LoadChildrenAction, type ITreeNode } from './ITreeNode';

export type TreeViewProps = {
  // Colors
  textColor?: string;
  disabledTextColor?: string;
  backgroundColor?: string;
  selectedTextColor?: string;
  selectedBackgroundColor?: string;
  hoverTextColor?: string;
  hoverBackgroundColor?: string;
  caretColor?: string;
  hoverCaretColor?: string;

  // Sizes
  gapBetweenItems?: number;
  gapToChildren?: number;
  caretSize?: number;

  // Appearance
  hasHover?: boolean; // Default true, If this is set, it uses the hover color for the mouse over effect
  hasCheckboxes?: boolean; // Default is false
  hasIcons?: boolean; // Default is false

  // Event handlers
  onSelect?: TreeNodeAction;
  onCheck?: TreeNodeAction;
  loadChildren?: LoadChildrenAction;

  // The root node of the tree, the root is not rendered.
  root: ITreeNode;
};
