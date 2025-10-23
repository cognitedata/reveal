import React from 'react';
import { describe, expect, test } from 'vitest';
import { render } from '@testing-library/react';
import { getIconName, getIconsInContainer, hasStringInStyle } from '#test-utils/cogs/htmlTestUtils';
import { TreeNode } from '../../model/tree-node';
import { TreeViewIcon } from './tree-view-icon';
import { SnowIcon } from '@cognite/cogs.js';

describe(TreeViewIcon.name, () => {
  test('should render the icon', () => {
    const node = new TreeNode();

    const { container } = render(<TreeViewIcon node={node} getIconFromIconName={() => SnowIcon} />);
    const icons = getIconsInContainer(container);
    expect(icons).toHaveLength(1);
    expect(getIconName(icons[0])).toBe('SnowIcon');
  });

  test('should render the icon with color', () => {
    const node = new TreeNode();
    const expected = '#012345';
    node.iconColor = expected;

    const { container } = render(<TreeViewIcon node={node} getIconFromIconName={() => SnowIcon} />);
    const icons = getIconsInContainer(container);
    expect(icons).toHaveLength(1);
    expect(hasStringInStyle(icons[0], expected)).toBe(true);
  });
});
