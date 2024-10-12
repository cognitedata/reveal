/*!
 * Copyright 2023 Cognite AS
 */

import { CheckBoxState } from './ITreeNode';
import { TreeNode } from './TreeNode';

export function createTreeMock(): TreeNode {
  const root = new TreeNode();
  root.label = 'Root';
  root.isExpanded = true;

  for (let i = 1; i <= 100; i++) {
    const child = new TreeNode();
    child.label = 'Folder ' + i;
    child.isExpanded = true;
    child.icon = 'Snow';
    child.checkBoxState = CheckBoxState.None;
    root.addChild(child);

    for (let j = 1; j <= 5; j++) {
      const child1 = new TreeNode();
      child1.label = 'Child ' + i + '.' + j;
      child1.icon = 'Snow';
      child1.isExpanded = false;
      child1.needLoading = true;
      child1.checkBoxState = CheckBoxState.None;
      child1.isEnabled = j !== 2;
      child1.hasBoldLabel = j === 4;

      child.addChild(child1);

      for (let k = 1; k <= 5; k++) {
        const child2 = new TreeNode();
        child2.icon = 'Bug';
        child2.label = 'Leaf ' + i + '.' + j + '.' + k;
        child2.checkBoxState = CheckBoxState.None;
        child2.isEnabled = k !== 3;
        child2.hasBoldLabel = k === 5;
        if (k === 4) child2.iconColor = 'darkred';
        if (k === 5) child2.iconColor = 'blue';
        child1.addChild(child2);
      }
    }
  }
  return root;
}
