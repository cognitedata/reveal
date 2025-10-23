import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { getButtonsInContainer, isSecondary } from '#test-utils/cogs/htmlTestUtils';
import { TreeNode } from '../../model/tree-node';
import { TreeViewLoadMore } from './tree-view-load-more';
import { type ILazyLoader } from '../../model/i-lazy-loader';
import { type TreeNodeType } from '../../model/tree-node-type';

const LABEL = 'Custom load more items';

describe(TreeViewLoadMore.name, () => {
  const loader = new EmptyLazyLoaderMock();

  test('should render the button with correct label and type', () => {
    const node = new TreeNode();
    const { container } = render(
      <TreeViewLoadMore node={node} level={1} label={LABEL} loader={loader} />
    );
    const buttons = getButtonsInContainer(container);

    expect(buttons).toHaveLength(1);
    expect(isSecondary(buttons[0])).toBe(true);
    expect(screen.getByText(LABEL)).toBeDefined();
  });

  test('should click on load more', async () => {
    const node = new TreeNode();
    node.loadSiblings = vi.fn();

    const { container } = render(<TreeViewLoadMore node={node} level={1} loader={loader} />);
    const buttons = getButtonsInContainer(container);

    await userEvent.click(buttons[0]);
    expect(node.loadSiblings).toBeCalledTimes(1);
    expect(node.loadSiblings).toBeCalledWith(loader);
  });
});

class EmptyLazyLoaderMock implements ILazyLoader {
  root: TreeNodeType | undefined;

  async loadChildren(_node: TreeNodeType): Promise<TreeNodeType[] | undefined> {
    return undefined;
  }

  async loadSiblings(_node: TreeNodeType): Promise<TreeNodeType[] | undefined> {
    return undefined;
  }
}
