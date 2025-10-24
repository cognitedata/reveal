import { type FC } from 'react';
import { describe, expect, test } from 'vitest';
import { render } from '@testing-library/react';
import { getIconName, getIconsInContainer, hasStringInStyle } from '#test-utils/cogs/htmlTestUtils';
import { TreeNode } from '../../model/tree-node';
import { TreeViewIcon, type TreeViewIconProps } from './tree-view-icon';
import { type IconProps, SnowIcon } from '@cognite/cogs.js';
import { type IconName } from '../../../architecture/base/utilities/types';

describe(TreeViewIcon.name, () => {
  test('should render the icon', () => {
    const node = new TreeNode();

    const container = renderMe({ node, getIconFromIconName });
    const icons = getIconsInContainer(container);
    expect(icons).toHaveLength(1);
    expect(getIconName(icons[0])).toBe('SnowIcon');
  });

  test('should render the icon with color', () => {
    const node = new TreeNode();
    const expected = '#012345';
    node.iconColor = expected;

    const container = renderMe({ node, getIconFromIconName });
    const icons = getIconsInContainer(container);
    expect(icons).toHaveLength(1);
    expect(hasStringInStyle(icons[0], expected)).toBe(true);
  });

  function renderMe(props: TreeViewIconProps): HTMLElement {
    return render(<TreeViewIcon {...props} />).container;
  }

  function getIconFromIconName(_icon: IconName): FC<IconProps> {
    return SnowIcon;
  }
});
