/*!
 * Copyright 2024 Cognite AS
 */

import { type ITreeNode } from './ITreeNode';
import { TreeNode } from './TreeNode';
import { CheckBoxState } from './types';

// ==================================================
// PUBLIC FUNCTIONS
// ==================================================

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

export function onMultiSelectNode(node: ITreeNode): void {
  if (!(node instanceof TreeNode)) {
    return;
  }
  node.isSelected = !node.isSelected;
}

export function onIndependentCheckNode(node: ITreeNode): void {
  if (!(node instanceof TreeNode)) {
    return;
  }
  if (node.checkBoxState === CheckBoxState.All) {
    node.checkBoxState = CheckBoxState.None;
  } else {
    node.checkBoxState = CheckBoxState.All;
  }
}
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
