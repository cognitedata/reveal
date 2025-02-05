/*!
 * Copyright 2025 Cognite AS
 */
import { type ILazyLoader } from './i-lazy-loader';
import { type TreeNodeAction, type CheckboxState, type IconColor, type IconName } from './types'; // AAA

export type TreeNodeType = {
  id: string; // Returns the unique id of the node

  // Required Appearance
  label: string; // Returns the label
  isSelected: boolean; // Returns true if it is selected
  isExpanded: boolean; // Returns true if expanded
  isVisibleInTree?: boolean; // Returns true if the label should be rendered in bold font

  // Optional Appearance
  isParent: boolean; // Returns true if this node has children (loaded or not loaded)
  hasBoldLabel?: boolean; // Returns true if the label should be rendered in bold font
  icon?: IconName; // Returns the icon, undefined is no icon
  iconColor?: IconColor; // undefined means default color, normally black
  isCheckboxEnabled?: boolean; // True if checkbox is enabled
  checkboxState?: CheckboxState; // Undefined it no checkbox

  // For lazy loading
  needLoadSiblings?: boolean; // Returns true if this node has more siblings to be loaded
  isLoadingChildren?: boolean; // Returns true if this node is loading children now
  isLoadingSiblings?: boolean; // Returns true if this node is loading siblings now

  /**
   * (Required) Get the children of this node. If the children are not loaded,
   * the lazy loader loader will optionally be used to load the children.
   */
  getChildren: (loader?: ILazyLoader) => Generator<TreeNodeType>;

  /**
   * The siblings will be inserted just after the this node.
   */
  loadSiblings?: (loader: ILazyLoader) => Promise<void>;

  // Add or remove listener functions for updating.
  addTreeNodeListener?: (listener: TreeNodeAction) => void;
  removeTreeNodeListener?: (listener: TreeNodeAction) => void;
};
