import { TreeNode } from './tree-node';
import { type TreeNodeType } from './tree-node-type';
import { CheckboxState } from './types';

/**
 * Handles the single selection of a tree node.
 * If the node is selected, it will deselect all other nodes in the tree.
 * If the node is not selected, it will select the node.
 *
 * @param node - The tree node to be selected or deselected.
 */
export function onSingleSelectNode(node: TreeNodeType): void {
  if (!(node instanceof TreeNode)) {
    return;
  }
  // Deselect all others
  const root = node.getRoot();
  for (const descendant of root.getThisAndDescendants()) {
    if (descendant !== node) {
      descendant.isSelected = false;
    }
  }
  node.isSelected = !node.isSelected;
}

/**
 * Handles the multi-selection of a tree node.
 * Toggles the selection state of the node without affecting other nodes.
 *
 * @param node - The tree node to be selected or deselected.
 */
export function onMultiSelectNode(node: TreeNodeType): void {
  if (!(node instanceof TreeNode)) {
    return;
  }
  node.isSelected = !node.isSelected;
}

/**
 * Handles the independent checkbox state of a tree node.
 * Toggles the checkbox state between `All` and `None`without affecting other nodes.
 *
 * @param node - The tree node whose checkbox state is to be toggled.
 */
export function onSimpleToggleNode(node: TreeNodeType): void {
  if (!(node instanceof TreeNode)) {
    return;
  }
  if (node.checkboxState === undefined) {
    return;
  }
  if (node.checkboxState === CheckboxState.All) {
    node.checkboxState = CheckboxState.None;
  } else {
    node.checkboxState = CheckboxState.All;
  }
}

/**
 * Handles the event when a node's checkbox is clicked, toggling its state between `All` and `None`.
 * It also updates the checkbox states of all its descendants and ancestors.
 *
 * @param node - The tree node that was clicked.
 *
 * @remarks
 * - If the node's checkbox state is `All`, it will be set to `None`, and vice versa.
 * - All descendants of the node will have their checkbox states updated to match the node's
 *   new state, unless their state is undefined.
 * - All ancestors of the node will have their checkbox states recalculated,
 *   unless their state is undefined.
 */
export function onRecursiveToggleNode(node: TreeNodeType): void {
  if (!(node instanceof TreeNode)) {
    return;
  }
  if (node.checkboxState === undefined) {
    return;
  }
  if (node.checkboxState === CheckboxState.All) {
    node.checkboxState = CheckboxState.None;
  } else {
    node.checkboxState = CheckboxState.All;
  }
  // Recalculate all descendants and ancestors
  for (const descendant of node.getDescendants()) {
    if (descendant.checkboxState !== undefined) {
      descendant.checkboxState = node.checkboxState;
    }
  }
  for (const ancestor of node.getAncestors()) {
    if (ancestor.checkboxState !== undefined) {
      ancestor.checkboxState = calculateCheckboxState(ancestor);
    }
  }
}

function calculateCheckboxState(node: TreeNodeType): CheckboxState | undefined {
  let numCandidates = 0;
  let numAll = 0;
  let numNone = 0;

  for (const child of node.getChildren()) {
    const checkboxState = child.checkboxState;
    if (child.isCheckboxEnabled !== true || checkboxState === undefined) {
      continue;
    }
    numCandidates += 1;
    if (checkboxState === CheckboxState.All) {
      numAll++;
    } else if (checkboxState === CheckboxState.None) {
      numNone++;
    }
    if (numNone < numCandidates && numCandidates < numAll) {
      return CheckboxState.Some; // Optimization by early return
    }
  }
  if (numCandidates === 0) {
    return node.checkboxState;
  }
  if (numCandidates === numAll) {
    return CheckboxState.All;
  }
  if (numCandidates === numNone) {
    return CheckboxState.None;
  }
  return CheckboxState.Some;
}
