/*!
 * Copyright 2025 Cognite AS
 */
import { type TreeNodeType } from './tree-node-type';
import { type OnNodeLoadedAction } from './types';

/** Interface for lazy loading tree nodes
 *
 * */
export type ILazyLoader = {
  /**
   * Gets the root node of the tree. If loadInitialRoot is not called, the root node is undefined.
   *
   * @returns {TreeNodeType | undefined} The root node of the tree, or undefined if the root node is not set.
   */
  root: TreeNodeType | undefined;

  /**
   * Loads the initial root node of the tree.
   *
   * @returns {Promise<TreeNodeType>} A promise that resolves to the root node of the tree.
   *
   * @remarks
   * If the root node has already been loaded, it returns the cached root node.
   * Otherwise, it should fetch the root node ,
   * sets it as the root node, marks it as expanded, and caches it for future use.
   *
   * @throws {Error} If there is an issue with fetching the root node from the SDK.
   */
  loadInitialRoot?: () => Promise<TreeNodeType>;

  /**
   * Load children for for a given parent node
   * @param node - The parent node for which to load children
   * @returns A promise that resolves to an array of tree nodes or undefined.
   */

  loadChildren: (parent: TreeNodeType) => Promise<TreeNodeType[] | undefined>;

  /**
   * Load siblings for a given node (the sibling will be inserted just after the node)
   * @param sibling - The sibling to where th other siblings are loaded from
   * @returns A promise that resolves to an array of tree nodes or undefined.
   */

  loadSiblings: (sibling: TreeNodeType) => Promise<TreeNodeType[] | undefined>;

  /**
   * Forces a node to be present in the tree by an nodeIdentifier. If the node is already in the tree,
   * it expands all its ancestors and returns the node. If the node is not in the tree, it fetches
   * the ancestors of the node, inserts them into the tree, expands all ancestors of the new node,
   * and returns the new node.
   *
   * @param nodeIdentifier - The identifier of the node to be forced into the tree. What the nodeIdentifier
   * will be is up to the implementation of the lazy loader, since this method is not called by the tree view.
   * @returns A promise that resolves to the tree node if it is successfully forced into the tree,
   *          or undefined if the root is undefined or the node could not be inserted.
   */
  forceNodeInTree?: (nodeIdentifier: number) => Promise<TreeNodeType | undefined>;

  /**
   * Callback function that is triggered when a node is loaded and just after it is
   * added/inserted into the tree.
   *
   * @param child - The child node that has been loaded.
   * @param parent - (Optional) The parent node of the loaded child node.
   */

  onNodeLoaded?: OnNodeLoadedAction;
};
