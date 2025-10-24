import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { getButtonsInContainer, isSecondary } from '#test-utils/cogs/htmlTestUtils';
import { TreeNode } from '../../model/tree-node';
import { TreeViewLoadMore, type TreeViewLoadMoreProps } from './tree-view-load-more';
import { EmptyLazyLoaderMock } from '#test-utils/tree-view/lazy-loaders/empty_lazy-loader-mock';

const LABEL = 'Custom load more items';

describe(TreeViewLoadMore.name, () => {
  const loader = new EmptyLazyLoaderMock();

  test('should render the button with correct label and type', () => {
    const node = new TreeNode();
    const container = renderMe({ node, level: 1, label: LABEL, loader });
    const buttons = getButtonsInContainer(container);

    expect(buttons).toHaveLength(1);
    expect(isSecondary(buttons[0])).toBe(true);
    expect(screen.getByText(LABEL)).toBeDefined();
  });

  test('should click on load more', async () => {
    const node = new TreeNode();
    node.loadSiblings = vi.fn();

    const container = renderMe({ node, level: 1, loader });
    const buttons = getButtonsInContainer(container);

    await userEvent.click(buttons[0]);
    expect(node.loadSiblings).toBeCalledTimes(1);
    expect(node.loadSiblings).toBeCalledWith(loader);
  });
});

function renderMe(props: TreeViewLoadMoreProps): HTMLElement {
  return render(<TreeViewLoadMore {...props} />).container;
}
