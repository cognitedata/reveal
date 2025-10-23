import React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from '@testing-library/react';
import { getIconName, getIconsInContainer } from '#test-utils/cogs/htmlTestUtils';
import { TreeNode } from '../../model/tree-node';
import { TreeViewInfo } from './tree-view-info';
import { type TreeNodeAction } from '../../model/types';
import userEvent from '@testing-library/user-event';

describe(TreeViewInfo.name, () => {
  test('should render with correct icon', () => {
    const node = new TreeNode();

    const { container } = render(<TreeViewInfo node={node} />);
    const icons = getIconsInContainer(container);

    expect(icons).toHaveLength(1);
    expect(getIconName(icons[0])).toBe('InfoIcon');
  });

  test('should click', async () => {
    const onClick = vi.fn<TreeNodeAction>();
    const node = new TreeNode();

    const { container } = render(<TreeViewInfo node={node} onClick={onClick} />);
    const icons = getIconsInContainer(container);

    await userEvent.click(icons[0]);
    expect(onClick).toBeCalledTimes(1);
    expect(onClick).toHaveBeenCalledWith(node);
  });
});
