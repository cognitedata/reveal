import { type FC } from 'react';
import { describe, expect, test, vi, assert } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getMocksByDefaultDependencies } from '#test-utils/vitest-extensions/getMocksByDefaultDependencies';
import { EmptyLazyLoaderMock } from '#test-utils/tree-view/lazy-loaders/empty_lazy-loader-mock';
import { AdvancedTreeViewNode } from './advanced-tree-view-node';
import {
  CustomAdvancedTreeViewNodeContext,
  defaultAdvancedTreeViewNodeDependencies
} from './advanced-tree-view-node.context';
import { TreeNode } from '../model/tree-node';
import { type AdvancedTreeViewProps } from './advanced-tree-view-props';
import { type TreeNodeAction } from '../model/types';
import { type IconName } from '../../architecture/base/utilities/types';
import { type IconProps, SnowIcon } from '@cognite/cogs.js';
import { createParentWithChildren } from '../../../tests/tests-utilities/tree-view/nodes/create-simple-tree-mock';

const mockDependencies = getMocksByDefaultDependencies(defaultAdvancedTreeViewNodeDependencies);

describe(AdvancedTreeViewNode.name, () => {
  test('should render', () => {
    const node = new TreeNode();
    const props: AdvancedTreeViewProps = {};
    const element = renderMe(node, props);
    expect(element.children).toHaveLength(1);
  });

  test('should select', async () => {
    const node = new TreeNode();
    const onSelectNode = vi.fn<TreeNodeAction>();
    const props: AdvancedTreeViewProps = { onSelectNode };
    renderMe(node, props);
    const line = screen.getByTestId('selectable-area');
    await userEvent.click(line);
    expect(onSelectNode).toBeCalledTimes(1);
    expect(onSelectNode).toHaveBeenCalledWith(node);
  });

  test('should render caret', () => {
    const node = new TreeNode();
    const props: AdvancedTreeViewProps = {};
    renderMe(node, props);
    expect(mockDependencies.TreeViewCaret).toHaveBeenCalledWith({ node }, expect.anything());
  });

  describe('should test checkbox', () => {
    test('not render', () => {
      const node = new TreeNode();
      const props: AdvancedTreeViewProps = { hasCheckboxes: false };
      renderMe(node, props);

      expect(mockDependencies.TreeViewCheckbox).not.toHaveBeenCalled();
    });

    test('render', () => {
      const node = new TreeNode();
      const onToggleNode = vi.fn<TreeNodeAction>();
      const props: AdvancedTreeViewProps = { hasCheckboxes: true, onToggleNode };
      renderMe(node, props);
      expect(mockDependencies.TreeViewCheckbox).toHaveBeenCalledWith(
        { node, onToggleNode },
        expect.anything()
      );
    });
  });

  describe('should test icon', () => {
    test('not render', () => {
      const node = new TreeNode();
      const props: AdvancedTreeViewProps = {};
      renderMe(node, props);
      expect(mockDependencies.TreeViewIcon).not.toHaveBeenCalledWith();
    });

    test('render', () => {
      const node = new TreeNode();
      node.icon = 'MyIcon';
      const getIconFromIconName = (_icon: IconName): FC<IconProps> => SnowIcon;

      const props: AdvancedTreeViewProps = { getIconFromIconName };
      renderMe(node, props);
      expect(mockDependencies.TreeViewIcon).toHaveBeenCalledWith(
        { node, getIconFromIconName },
        expect.anything()
      );
    });
  });

  describe('should test loading label', () => {
    test('not render', () => {
      const node = new TreeNode();
      const props: AdvancedTreeViewProps = {};
      renderMe(node, props);
      expect(mockDependencies.TreeViewLoading).not.toHaveBeenCalled();
    });

    test('render (when loading children)', () => {
      const node = new TreeNode();
      node.isLoadingChildren = true;
      const loadingLabel = 'My Loading...';
      const props: AdvancedTreeViewProps = {
        loadingLabel
      };
      renderMe(node, props);
      expect(mockDependencies.TreeViewLoading).toHaveBeenCalledWith(
        { label: loadingLabel },
        expect.anything()
      );
    });

    test('render (when loading siblings)', () => {
      const node = new TreeNode();
      node.isLoadingSiblings = true;
      const loadingLabel = 'My Loading...';
      const props: AdvancedTreeViewProps = {
        loadingLabel
      };
      const level = 4;
      renderMe(node, props, level);
      expect(mockDependencies.TreeViewLoading).toHaveBeenCalledWith(
        { label: loadingLabel, level },
        expect.anything()
      );
    });
  });

  describe('should test label', () => {
    test('not render', () => {
      const node = new TreeNode();
      node.isLoadingChildren = true;
      node.label = 'My label';
      const props: AdvancedTreeViewProps = {};
      renderMe(node, props);
      expect(mockDependencies.TreeViewLabel).not.toHaveBeenCalled();
    });

    test('render', () => {
      const node = new TreeNode();
      node.isLoadingChildren = false;
      node.label = 'My label';
      const maxLabelLength = 10;
      const props: AdvancedTreeViewProps = { maxLabelLength };
      renderMe(node, props);
      expect(mockDependencies.TreeViewLabel).toHaveBeenCalledWith(
        { node, maxLabelLength },
        expect.anything()
      );
    });
  });

  describe('should test info', () => {
    test('not render', () => {
      const node = new TreeNode();
      const props: AdvancedTreeViewProps = {};
      renderMe(node, props);
      expect(mockDependencies.TreeViewInfo).not.toHaveBeenCalled();
    });

    test('render', () => {
      const node = new TreeNode();
      node.hasInfoIcon = true;
      const onClickInfo = vi.fn<TreeNodeAction>();

      const props: AdvancedTreeViewProps = { onClickInfo };
      renderMe(node, props);
      expect(mockDependencies.TreeViewInfo).toHaveBeenCalledWith(
        { node, onClick: onClickInfo },
        expect.anything()
      );
    });
  });

  describe('should test load more label', () => {
    test('not render', () => {
      const node = new TreeNode();
      const props: AdvancedTreeViewProps = {};
      renderMe(node, props);
      expect(mockDependencies.TreeViewLoadMore).not.toHaveBeenCalled();
    });

    test('render', () => {
      const node = new TreeNode();
      node.needLoadSiblings = true;
      node.loadSiblings = async () => undefined;
      const loader = new EmptyLazyLoaderMock();
      const loadMoreLabel = 'My load more';
      const props: AdvancedTreeViewProps = { loadMoreLabel, loader };
      const level = 4;
      renderMe(node, props, level);
      expect(mockDependencies.TreeViewLoadMore).toHaveBeenCalledWith(
        { node, level, label: loadMoreLabel, loader },
        expect.anything()
      );
    });
  });

  describe('should test with or without children', () => {
    test('not render when no children', () => {
      const node = new TreeNode();
      const props: AdvancedTreeViewProps = {};
      renderMe(node, props);
      expect(mockDependencies.TreeViewChild).not.toHaveBeenCalled();
    });

    test('not render children when parent is not expanded', () => {
      const parent = createParentWithChildren(10);
      expect(parent.childCount).toBe(10);
      assert(parent.children !== undefined);
      parent.isExpanded = false;
      const props: AdvancedTreeViewProps = { showRoot: true };
      renderMe(parent, props);
      expect(mockDependencies.TreeViewChild).not.toHaveBeenCalled();
    });

    test('render children when parent is expanded', () => {
      const parent = createParentWithChildren(10);
      expect(parent.childCount).toBe(10);
      assert(parent.children !== undefined);
      parent.isExpanded = true;
      const props: AdvancedTreeViewProps = {};
      const level = 4;
      renderMe(parent, props, level);

      for (let index = 0; index < parent.childCount; index++) {
        expect(mockDependencies.TreeViewChild).toHaveBeenNthCalledWith(
          index + 1,
          { node: parent.children[index], level: level + 1, props },
          expect.anything()
        );
      }
    });
  });
});

function renderMe(node: TreeNode, props: AdvancedTreeViewProps, level = 1): HTMLElement {
  const { container } = render(
    <CustomAdvancedTreeViewNodeContext.Provider value={mockDependencies}>
      <AdvancedTreeViewNode node={node} level={level} props={props} />
    </CustomAdvancedTreeViewNodeContext.Provider>
  );
  return container;
}
