import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { getButtonsInContainer, isSecondary } from '#test-utils/cogs/htmlTestUtils';
import { TreeNode } from '../../model/tree-node';
import type { TreeNodeAction } from '../../model/types';
import { TreeViewLoadMore } from './tree-view-load-more';

const LABEL = 'Custom load more items';

describe(TreeViewLoadMore.name, () => {
  test('should render the button with correct label and type', () => {
    const onClick = vi.fn<TreeNodeAction>();
    const node = new TreeNode();

    const { container } = render(
      <TreeViewLoadMore node={node} onClick={onClick} level={1} label={LABEL} />
    );
    const buttons = getButtonsInContainer(container);

    expect(buttons).toHaveLength(1);
    expect(isSecondary(buttons[0])).toBe(true);
    expect(screen.getByText(LABEL)).toBeDefined();
  });

  test('should click', async () => {
    const onClick = vi.fn<TreeNodeAction>();
    const node = new TreeNode();

    const { container } = render(<TreeViewLoadMore node={node} onClick={onClick} level={1} />);
    const buttons = getButtonsInContainer(container);

    await userEvent.click(buttons[0]);
    expect(onClick).toBeCalledTimes(1);
  });
});
