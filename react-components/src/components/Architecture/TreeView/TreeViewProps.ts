/*!
 * Copyright 2024 Cognite AS
 */

import { type ITreeNode } from '../../../architecture/base/treeView/ITreeNode';
import {
  type LoadNodesAction,
  type TreeNodeAction
} from '../../../architecture/base/treeView/types';

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
  infoColor?: string;
  hoverInfoColor?: string;

  // Sizes
  gapBetweenItems?: number;
  gapToChildren?: number;
  caretSize?: number;

  // Appearance
  showRoot?: boolean; // Show root, default is true
  hasHover?: boolean; // Default true, If this is set, it uses the hover color for the mouse over effect
  hasCheckboxes?: boolean; // Default is false
  hasIcons?: boolean; // Default is false
  hasInfo?: boolean; // Default is false
  loadingLabel?: string; // Default is 'Loading...'
  loadMoreLabel?: string; // Default is 'Load more...'
  maxLabelLength?: number;

  // Event handlers
  onSelectNode?: TreeNodeAction;
  onCheckNode?: TreeNodeAction;
  onClickInfo?: TreeNodeAction;
  loadNodes?: LoadNodesAction;

  // The root node of the tree, the root is not rendered.
  root: ITreeNode;
};
