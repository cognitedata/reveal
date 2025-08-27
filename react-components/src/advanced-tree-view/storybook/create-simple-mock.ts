import { TreeNode } from '../model/tree-node';
import { CheckboxState } from '../model/types';

type SimpleMockArgs = {
  hasColors?: boolean;
  hasBoldLabels?: boolean;
  hasCheckboxes?: boolean;
  hasDisabledCheckboxes?: boolean;
};

export function createSimpleMock(args: SimpleMockArgs): TreeNode {
  const root = new TreeNode();
  root.label = 'Europa';
  root.isExpanded = true;

  const germany = add(root, 'Germany', true);
  add(germany, 'Frankfurt');
  const berlin = add(germany, 'Berlin');
  add(berlin, 'Mitte');

  const norway = add(root, 'Norway', true);
  add(norway, 'Bergen');
  add(norway, 'Oslo');

  for (const node of root.getThisAndDescendants()) {
    if (args.hasColors === true) {
      node.iconColor = getRandomColor();
    }
    if (args.hasBoldLabels === true) {
      node.hasBoldLabel = Math.random() < 0.5;
    }
    if (args.hasDisabledCheckboxes === true) {
      node.isCheckboxEnabled = Math.random() < 0.5;
    }
    if (args.hasCheckboxes === true) {
      node.checkboxState = CheckboxState.None;
    }
    node.icon = node.isParent ? 'Folder' : 'Snow';
  }
  return root;

  function add(parent: TreeNode, label: string, isExpanded = false): TreeNode {
    const child = new TreeNode();
    child.label = label;
    child.isExpanded = isExpanded;
    parent.addChild(child);
    return child;
  }
}

export function getRandomColor(): string {
  const hue = Math.random() * 255;
  return `hsl(${hue}, 100%, 50%)`;
}
