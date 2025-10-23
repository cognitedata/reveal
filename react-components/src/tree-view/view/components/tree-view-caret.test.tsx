import { describe, expect, test, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';
import { getIconName, getIconsInContainer } from '#test-utils/cogs/htmlTestUtils';
import { TreeNode } from '../../model/tree-node';
import type { TreeNodeAction } from '../../model/types';
import { TreeViewCaret } from './tree-view-caret';
import { type AdvancedTreeViewProps } from '../advanced-tree-view-props';

describe(TreeViewCaret.name, () => {
  test('should not render with icon when it is leaf', () => {
    const onClick = vi.fn<TreeNodeAction>();
    const props: AdvancedTreeViewProps = {};
    const node = new TreeNode();

    const { container } = render(<TreeViewCaret node={node} onClick={onClick} props={props} />);
    const icons = getIconsInContainer(container);
    expect(icons).toHaveLength(0);
  });

  test('should render with correct icon when it is parent', () => {
    const onClick = vi.fn<TreeNodeAction>();
    const props: AdvancedTreeViewProps = {};
    const node = new TreeNode();
    node.addChild(new TreeNode());

    for (const expanded of [true, false]) {
      node.isExpanded = expanded;
      const { container } = render(<TreeViewCaret node={node} onClick={onClick} props={props} />);
      const icons = getIconsInContainer(container);
      expect(icons).toHaveLength(1);
      expect(getIconName(icons[0])).toBe(expanded ? 'CaretDownIcon' : 'CaretRightIcon');
    }
  });

  test('should click', async () => {
    const onClick = vi.fn<TreeNodeAction>();
    const props: AdvancedTreeViewProps = {};
    const node = new TreeNode();
    node.addChild(new TreeNode());

    const { container } = render(<TreeViewCaret node={node} onClick={onClick} props={props} />);
    const icons = getIconsInContainer(container);

    await userEvent.click(icons[0]);
    expect(onClick).toBeCalledTimes(1);
  });
});

// import { render, screen } from '@testing-library/react';
// //   //const button = screen.getByLabelText('sss');
