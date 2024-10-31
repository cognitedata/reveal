/*!
 * Copyright 2024 Cognite AS
 */

import { type ITreeNode } from './ITreeNode';
import { TreeNode } from './TreeNode';
import { CheckBoxState } from './types';

// ==================================================
// PUBLIC FUNCTIONS
// ==================================================

/**
 * Handles the single selection of a tree node.
 * If the node is selected, it will deselect all other nodes in the tree.
 * If the node is not selected, it will select the node.
 *
 * @param node - The tree node to be selected or deselected.
 */
export function onSingleSelectNode(node: ITreeNode): void {
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
export function onMultiSelectNode(node: ITreeNode): void {
  if (!(node instanceof TreeNode)) {
    return;
  }
  node.isSelected = !node.isSelected;
}

/**
 * Handles the independent checkbox state of a tree node.
 * Toggles the checkbox state between `All` and `None`.
 *
 * @param node - The tree node whose checkbox state is to be toggled.
 */
export function onIndependentCheckNode(node: ITreeNode): void {
  if (!(node instanceof TreeNode)) {
    return;
  }
  if (node.checkBoxState === CheckBoxState.All) {
    node.checkBoxState = CheckBoxState.None;
  } else {
    node.checkBoxState = CheckBoxState.All;
  }
  console.log('Clicked node: ' + node.label);
  if (node instanceof TreeNode) {
    console.log('Check nodes');
    for (const child of node.getRoot().getCheckedNodes()) {
      console.log(child.label);
    }
  }
}

/**
 * Handles the event when a node's checkbox is clicked, toggling its state between `All` and `None`.
 * It also updates the checkbox states of all its descendants and recalculates the states of its ancestors.
 *
 * @param node - The tree node that was clicked.
 *
 * @remarks
 * - If the node's checkbox state is `All`, it will be set to `None`, and vice versa.
 * - All descendants of the node will have their checkbox states updated to match the node's new state, unless their state is `Hidden`.
 * - All ancestors of the node will have their checkbox states recalculated, unless their state is `Hidden`.
 * - Logs the label of the clicked node and the labels of all checked nodes in the root.
 */
export function onDependentCheckNode(node: ITreeNode): void {
  if (!(node instanceof TreeNode)) {
    return;
  }
  if (node.checkBoxState === CheckBoxState.All) {
    node.checkBoxState = CheckBoxState.None;
  } else {
    node.checkBoxState = CheckBoxState.All;
  }
  // Recalculate all descendants and ancestors
  for (const descendant of node.getDescendants()) {
    if (descendant.checkBoxState !== CheckBoxState.Hidden) {
      descendant.checkBoxState = node.checkBoxState;
    }
  }
  for (const ancestor of node.getAncestors()) {
    if (ancestor.checkBoxState !== CheckBoxState.Hidden) {
      ancestor.checkBoxState = calculateCheckBoxState(ancestor);
    }
  }
  console.log('Clicked node: ' + node.label);
  if (node instanceof TreeNode) {
    console.log('Check nodes');
    for (const child of node.getRoot().getCheckedNodes()) {
      console.log(child.label);
    }
  }
}

// ==================================================
// PRIVATE FUNCTIONS
// ==================================================

function calculateCheckBoxState(node: ITreeNode): CheckBoxState {
  let numCandidates = 0;
  let numAll = 0;
  let numNone = 0;

  for (const child of node.getChildren()) {
    const checkBoxState = child.checkBoxState;
    if (!child.isEnabled || checkBoxState === CheckBoxState.Hidden) {
      continue;
    }
    numCandidates++;
    if (checkBoxState === CheckBoxState.All) {
      numAll++;
    } else if (checkBoxState === CheckBoxState.None) {
      numNone++;
    }
    if (numNone < numCandidates && numCandidates < numAll) {
      return CheckBoxState.Some; // Optimization by early return
    }
  }
  if (numCandidates === 0) {
    return node.checkBoxState;
  }
  if (numCandidates === numAll) {
    return CheckBoxState.All;
  }
  if (numCandidates === numNone) {
    return CheckBoxState.None;
  }
  return CheckBoxState.Some;
}
