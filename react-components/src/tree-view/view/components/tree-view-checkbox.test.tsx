import { describe, expect, test, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';
import { getCheckboxState, getInputsInContainer } from '#test-utils/cogs/htmlTestUtils';
import { TreeNode } from '../../model/tree-node';
import type { TreeNodeAction } from '../../model/types';
import { TreeViewCheckbox, type TreeViewCheckboxProps } from './tree-view-checkbox';
import { CheckboxState } from '../../../architecture/base/utilities/types';

describe(TreeViewCheckbox.name, () => {
  test('should render the checkbox with correct checkboxState', () => {
    const onToggleNode = vi.fn<TreeNodeAction>();
    for (const state of [CheckboxState.None, CheckboxState.Some, CheckboxState.All, undefined]) {
      const node = new TreeNode();
      node.checkboxState = state;
      node.isCheckboxEnabled = true;

      const container = renderMe({ node, onToggleNode });
      const checkboxes = getInputsInContainer(container);

      expect(checkboxes).toHaveLength(state === undefined ? 0 : 1);
      if (state !== undefined) {
        expect(getCheckboxState(checkboxes[0])).toBe(node.checkboxState);
      }
    }
  });

  test('should click', async () => {
    for (const checkboxState of [CheckboxState.None, CheckboxState.Some, CheckboxState.All]) {
      const onToggleNode = vi.fn<TreeNodeAction>();
      const node = new TreeNode();
      node.checkboxState = checkboxState;
      node.isCheckboxEnabled = true;

      const container = renderMe({ node, onToggleNode });
      const checkboxes = getInputsInContainer(container);

      await userEvent.click(checkboxes[0]);
      expect(onToggleNode).toBeCalledTimes(1);
      expect(onToggleNode).toBeCalledWith(node);
    }
  });

  function renderMe(props: TreeViewCheckboxProps): HTMLElement {
    return render(<TreeViewCheckbox {...props} />).container;
  }
});
