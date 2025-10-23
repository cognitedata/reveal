import { describe, expect, test, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';
import { getIconName, getIconsInContainer } from '#test-utils/cogs/htmlTestUtils';
import { TreeNode } from '../../model/tree-node';
import type { TreeNodeAction } from '../../model/types';
import { TreeViewCaret } from './tree-view-caret';

describe(TreeViewCaret.name, () => {
  test('should not render with icon when it is leaf', () => {
    const onClick = vi.fn<TreeNodeAction>();
    const node = new TreeNode();

    const { container } = render(<TreeViewCaret node={node} onClick={onClick} />);
    const icons = getIconsInContainer(container);
    expect(icons).toHaveLength(0);
  });

  test('should render with correct icon when it is parent', () => {
    const onClick = vi.fn<TreeNodeAction>();
    const node = new TreeNode();
    node.addChild(new TreeNode());

    for (const expanded of [true, false]) {
      node.isExpanded = expanded;
      const { container } = render(<TreeViewCaret node={node} onClick={onClick} />);
      const icons = getIconsInContainer(container);
      expect(icons).toHaveLength(1);
      expect(getIconName(icons[0])).toBe(expanded ? 'CaretDownIcon' : 'CaretRightIcon');
    }
  });

  test('should click', async () => {
    const onClick = vi.fn<TreeNodeAction>();
    const node = new TreeNode();
    node.addChild(new TreeNode());

    const { container } = render(<TreeViewCaret node={node} onClick={onClick} />);
    const icons = getIconsInContainer(container);

    await userEvent.click(icons[0]);
    expect(onClick).toBeCalledTimes(1);
  });
});

// import { render, screen } from '@testing-library/react';
// //   //const button = screen.getByLabelText('sss');
