import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { TreeViewLabel } from './tree-view-label';
import { TreeNode } from '../../model/tree-node';

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
});
