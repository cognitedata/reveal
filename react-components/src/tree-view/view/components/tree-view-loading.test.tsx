import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { getIconName, getIconsInContainer } from '#test-utils/cogs/htmlTestUtils';
import { TreeViewLoading } from './tree-view-loading';

const LABEL = 'Custom loading label';

describe(TreeViewLoading.name, () => {
  test('should render with correct icon', () => {
    const { container } = render(<TreeViewLoading level={1} label={LABEL} />);
    const icons = getIconsInContainer(container);

    expect(icons).toHaveLength(1);
    expect(getIconName(icons[0])).toBe('LoaderIcon');
  });

  test('should render with correct label', () => {
    render(<TreeViewLoading level={1} label={LABEL} />);
    expect(screen.getByText(LABEL)).toBeDefined();
  });
});
