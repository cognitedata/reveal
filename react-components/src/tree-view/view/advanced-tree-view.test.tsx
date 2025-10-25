import { describe, expect, test, assert } from 'vitest';
import { render } from '@testing-library/react';
import { getMocksByDefaultDependencies } from '#test-utils/vitest-extensions/getMocksByDefaultDependencies';
import { TreeNode } from '../model/tree-node';
import { type AdvancedTreeViewProps } from './advanced-tree-view-props';
import {
  CustomAdvancedTreeViewContext,
  defaultAdvancedTreeViewDependencies
} from './advanced-tree-view.context';
import { AdvancedTreeView } from './advanced-tree-view';
import { createParentWithChildren } from '../../../tests/tests-utilities/tree-view/nodes/create-simple-tree-mock';

const mockDependencies = getMocksByDefaultDependencies(defaultAdvancedTreeViewDependencies);

describe(AdvancedTreeView.name, () => {
  describe('root', () => {
    test('should render loader when no root', () => {
      const props: AdvancedTreeViewProps = {};
      renderMe(props);

      // This will result in a loader since there is no root
      expect(mockDependencies.AdvancedTreeViewNode).not.toHaveBeenCalled();
      expect(mockDependencies.Loader).toHaveBeenCalled();
    });

    test('should render root when show root set to true', () => {
      const root = new TreeNode();
      const props: AdvancedTreeViewProps = { root, showRoot: true };
      renderMe(props);

      // This will result in one node in the tree
      expect(mockDependencies.AdvancedTreeViewNode).toHaveBeenCalled();
      expect(mockDependencies.AdvancedTreeViewNode).toHaveBeenCalledWith(
        { node: root, level: 0, props },
        expect.anything()
      );
      expect(mockDependencies.Loader).not.toHaveBeenCalled();
    });

    test('should render nothing when show root set to false', () => {
      const root = new TreeNode();
      const props: AdvancedTreeViewProps = { root, showRoot: false };
      renderMe(props);

      // This will result in an empty tree since the root has no children
      expect(mockDependencies.AdvancedTreeViewNode).not.toHaveBeenCalled();
      expect(mockDependencies.Loader).not.toHaveBeenCalled();
    });

    test('should render children only when show root set to false', () => {
      const root = createParentWithChildren(10);
      expect(root.childCount).toBe(10);
      assert(root.children !== undefined);

      const props: AdvancedTreeViewProps = { root, showRoot: false };
      renderMe(props);

      // Check that children is rendered (root should be not rendered)
      for (let index = 0; index < root.childCount; index++) {
        expect(mockDependencies.AdvancedTreeViewNode).toHaveBeenNthCalledWith(
          index + 1,
          { node: root.children[index], level: 0, props },
          expect.anything()
        );
      }
      expect(mockDependencies.Loader).not.toHaveBeenCalled();
    });
  });
});

function renderMe(props: AdvancedTreeViewProps): HTMLElement {
  const { container } = render(
    <CustomAdvancedTreeViewContext.Provider value={mockDependencies}>
      <AdvancedTreeView {...props} />
    </CustomAdvancedTreeViewContext.Provider>
  );
  return container;
}
