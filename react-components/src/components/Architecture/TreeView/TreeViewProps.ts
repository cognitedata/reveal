/*!
 * Copyright 2024 Cognite AS
 */

import { type ITreeNode } from '../../../architecture/base/treeNodes/ITreeNode';
import {
  type LoadNodesAction,
  type TreeNodeAction
} from '../../../architecture/base/treeNodes/types';

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

  // Labels are not translated. Should be done on the app side?
  loadingLabel?: string; // Default is 'Loading...'
  loadMoreLabel?: string; // Default is 'Load more...'
  maxLabelLength?: number; // Make length of label

  // Event handlers
  onSelectNode?: TreeNodeAction; // Called when user select a node
  onCheckNode?: TreeNodeAction; // Called when user check a node
  onClickInfo?: TreeNodeAction; // Called when user click the info icon
  loadNodes?: LoadNodesAction; // Called when lazy loading
  getId?: (node: ITreeNode) => string; // This make it possible to set the id of the component in the tree. Used for scrolling.

  // The root node of the tree, the root is not rendered.
  root: ITreeNode;
};
