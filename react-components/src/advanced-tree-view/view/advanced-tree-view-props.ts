/*!
 * Copyright 2025 Cognite AS
 */
import { type IconProps } from '@cognite/cogs.js';

import { type ILazyLoader } from '../model/i-lazy-loader';
import { type TreeNodeType } from '../model/tree-node-type';
import { type IconName, type TreeNodeAction } from '../model/types';
import { type FC } from 'react';

export type AdvancedTreeViewProps = {
  // Appearance
  showRoot?: boolean; // Show root, default is true
  hasHover?: boolean; // Default true, If this is set, it uses the hover color for the mouse over effect
  hasCheckboxes?: boolean; // Default is true, but if the node has checkboxState == undefined, it will not be shown anyway

  // Labels are not translated. Should be done on the app side?
  loadingLabel?: string; // Default is 'Loading...'
  loadMoreLabel?: string; // Default is 'Load more...'
  maxLabelLength?: number; // Max length of label before it is truncated and a tooltip will appear

  // Event handlers
  onSelectNode?: TreeNodeAction; // Called when user select a node
  onToggleNode?: TreeNodeAction; // Called when user toggle a node
  onClickInfo?: TreeNodeAction; // Called when user click the info icon, if undefined, no info icon will appear
  getIconFromIconName?: GetIconFromIconNameFn; // Function to get the icon for a node, if not set no icon will appear

  // The root node of the tree (used only if loader is not set)
  root?: TreeNodeType;

  // Lazy loading manager (if this is set, the root above will be ignore,
  // because the root is taken from the lazy loader)
  loader?: ILazyLoader;
};

/*
 * Convert between a string to the actual Cogs icon component.
 * This is made to avoid references to Cogs in the data model
 * so the data model can be independent on JXS.
 */

export type GetIconFromIconNameFn = (icon: IconName) => FC<IconProps>;
