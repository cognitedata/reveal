import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { TreeViewLabel } from './tree-view-label';
import { TreeNode } from '../../model/tree-node';
import userEvent from '@testing-library/user-event';

const LABEL = 'Name of the node';

describe(TreeViewLabel.name, () => {
  test('should render with correct label', () => {
    const node = new TreeNode();
    node.label = LABEL;
    render(<TreeViewLabel node={node} />);
    expect(screen.getByText(LABEL)).toBeDefined();
  });

  test('should render with truncated label', () => {
    const node = new TreeNode();
    node.label = LABEL;
    render(<TreeViewLabel node={node} maxLabelLength={4} />);
    expect(screen.getByText('Name...')).toBeDefined();
  });

  test('should show tooltip content on hover when truncated label', async () => {
    const node = new TreeNode();
    node.label = LABEL;
    render(<TreeViewLabel node={node} maxLabelLength={4} />);
    const labelElement = screen.getByText('Name...');

    // hover
    await userEvent.hover(labelElement);

    // tooltip should appear
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toBeDefined();
  });

  test('should not show tooltip content on hover when not truncated label', async () => {
    const node = new TreeNode();
    node.label = LABEL;
    render(<TreeViewLabel node={node} />);
    const labelElement = screen.getByText(LABEL);

    // hover
    await userEvent.hover(labelElement);

    // tooltip should not appear
    const tooltip = screen.queryByRole('tooltip');
    expect(tooltip).toBeNull();
  });
});
