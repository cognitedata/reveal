import { describe, expect, test } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';
import { getIconName, getIconsInContainer } from '#test-utils/cogs/htmlTestUtils';
import { TreeNode } from '../../model/tree-node';
import { TreeViewCaret, type TreeViewCaretProps } from './tree-view-caret';

describe(TreeViewCaret.name, () => {
  test('should not render the caret when it is leaf', () => {
    const node = new TreeNode();

    const container = renderMe({ node });
    const icons = getIconsInContainer(container);

    expect(icons).toHaveLength(0);
  });

  test('should render he caret with correct icon when it is parent', () => {
    const node = new TreeNode();
    node.addChild(new TreeNode());

    for (const expanded of [true, false]) {
      node.isExpanded = expanded;
      const container = renderMe({ node });
      const icons = getIconsInContainer(container);

      expect(icons).toHaveLength(1);
      expect(getIconName(icons[0])).toBe(expanded ? 'CaretDownIcon' : 'CaretRightIcon');
    }
  });

  test('should expand node', async () => {
    const node = new TreeNode();
    node.addChild(new TreeNode());

    node.isExpanded = false;
    const container = renderMe({ node });
    const icons = getIconsInContainer(container);

    await userEvent.click(icons[0]);
    expect(node.isExpanded).toBe(true);
  });

  test('should collapse node', async () => {
    const node = new TreeNode();
    node.addChild(new TreeNode());

    node.isExpanded = true;
    const container = renderMe({ node });
    const icons = getIconsInContainer(container);

    await userEvent.click(icons[0]);
    expect(node.isExpanded).toBe(false);
  });
});

function renderMe(props: TreeViewCaretProps): HTMLElement {
  return render(<TreeViewCaret {...props} />).container;
}
