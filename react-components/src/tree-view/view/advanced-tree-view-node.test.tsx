import { type ReactElement, type PropsWithChildren, type FC } from 'react';
import { describe, expect, test, vi, assert } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getMocksByDefaultDependencies } from '#test-utils/vitest-extensions/getMocksByDefaultDependencies';
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
import { type ILazyLoader } from '../model/i-lazy-loader';
import { type TreeNodeType } from '../model/tree-node-type';

describe(AdvancedTreeViewNode.name, () => {
  const mockDependencies = getMocksByDefaultDependencies(defaultAdvancedTreeViewNodeDependencies);
  const wrapper = ({ children }: PropsWithChildren): ReactElement => (
    <CustomAdvancedTreeViewNodeContext.Provider value={mockDependencies}>
      {children}
    </CustomAdvancedTreeViewNodeContext.Provider>
  );

  describe('root', () => {
    test('render', () => {
      const node = new TreeNode();
      const props: AdvancedTreeViewProps = {};
      const element = renderMe(node, props, wrapper);
      expect(element.children).toHaveLength(1);
    });

    test('should select', async () => {
      const node = new TreeNode();
      const onSelectNode = vi.fn<TreeNodeAction>();
      const props: AdvancedTreeViewProps = { onSelectNode };
      renderMe(node, props, wrapper);
      const line = screen.getByTestId('selectable-area');
      await userEvent.click(line);
      expect(onSelectNode).toBeCalledTimes(1);
      expect(onSelectNode).toHaveBeenCalledWith(node);
    });
  });

  describe('caret', () => {
    test('render', () => {
      const node = new TreeNode();
      const props: AdvancedTreeViewProps = {};
      renderMe(node, props, wrapper);
      expect(mockDependencies.TreeViewCaret).toHaveBeenCalledWith({ node }, expect.anything());
    });
  });

  describe('checkbox', () => {
    test('not render', () => {
      const node = new TreeNode();
      const props: AdvancedTreeViewProps = { hasCheckboxes: false };
      renderMe(node, props, wrapper);

      expect(mockDependencies.TreeViewCheckbox).not.toHaveBeenCalled();
    });

    test('render', () => {
      const node = new TreeNode();
      const onToggleNode = vi.fn<TreeNodeAction>();
      const props: AdvancedTreeViewProps = { hasCheckboxes: true, onToggleNode };
      renderMe(node, props, wrapper);
      expect(mockDependencies.TreeViewCheckbox).toHaveBeenCalledWith(
        { node, onToggleNode },
        expect.anything()
      );
    });
  });

  describe('icon', () => {
    test('not render', () => {
      const node = new TreeNode();
      const props: AdvancedTreeViewProps = {};
      renderMe(node, props, wrapper);
      expect(mockDependencies.TreeViewIcon).not.toHaveBeenCalledWith();
    });

    test('render', () => {
      const node = new TreeNode();
      node.icon = 'MyIcon';
      const getIconFromIconName = (_icon: IconName): FC<IconProps> => SnowIcon;

      const props: AdvancedTreeViewProps = { getIconFromIconName };
      renderMe(node, props, wrapper);
      expect(mockDependencies.TreeViewIcon).toHaveBeenCalledWith(
        { node, getIconFromIconName },
        expect.anything()
      );
    });
  });

  describe('loading label', () => {
    test('not render', () => {
      const node = new TreeNode();
      const props: AdvancedTreeViewProps = {};
      renderMe(node, props, wrapper);
      expect(mockDependencies.TreeViewLoading).not.toHaveBeenCalled();
    });

    test('render (when loading children)', () => {
      const node = new TreeNode();
      node.isLoadingChildren = true;
      const loadingLabel = 'My Loading...';
      const props: AdvancedTreeViewProps = {
        loadingLabel
      };
      renderMe(node, props, wrapper);
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
      renderMe(node, props, wrapper, level);
      expect(mockDependencies.TreeViewLoading).toHaveBeenCalledWith(
        { label: loadingLabel, level },
        expect.anything()
      );
    });
  });

  describe('label', () => {
    test('not render', () => {
      const node = new TreeNode();
      node.isLoadingChildren = true;
      node.label = 'My label';
      const props: AdvancedTreeViewProps = {};
      renderMe(node, props, wrapper);
      expect(mockDependencies.TreeViewLabel).not.toHaveBeenCalled();
    });

    test('render', () => {
      const node = new TreeNode();
      node.isLoadingChildren = false;
      node.label = 'My label';
      const maxLabelLength = 10;
      const props: AdvancedTreeViewProps = { maxLabelLength };
      renderMe(node, props, wrapper);
      expect(mockDependencies.TreeViewLabel).toHaveBeenCalledWith(
        { node, maxLabelLength },
        expect.anything()
      );
    });
  });

  describe('info', () => {
    test('not render', () => {
      const node = new TreeNode();
      const props: AdvancedTreeViewProps = {};
      renderMe(node, props, wrapper);
      expect(mockDependencies.TreeViewInfo).not.toHaveBeenCalled();
    });

    test('render', () => {
      const node = new TreeNode();
      node.hasInfoIcon = true;
      const onClickInfo = vi.fn<TreeNodeAction>();

      const props: AdvancedTreeViewProps = { onClickInfo };
      renderMe(node, props, wrapper);
      expect(mockDependencies.TreeViewInfo).toHaveBeenCalledWith(
        { node, onClick: onClickInfo },
        expect.anything()
      );
    });
  });

  describe('load more label', () => {
    test('not render', () => {
      const node = new TreeNode();
      const props: AdvancedTreeViewProps = {};
      renderMe(node, props, wrapper);
      expect(mockDependencies.TreeViewLoadMore).not.toHaveBeenCalled();
    });
    test('render', () => {
      const node = new TreeNode();
      node.needLoadSiblings = true;
      node.loadSiblings = async () => undefined;
      const loader = new LazyLoaderMock();
      const loadMoreLabel = 'My load more';
      const props: AdvancedTreeViewProps = { loadMoreLabel, loader };
      const level = 4;
      renderMe(node, props, wrapper, level);
      expect(mockDependencies.TreeViewLoadMore).toHaveBeenCalledWith(
        { node, level, label: loadMoreLabel, loader },
        expect.anything()
      );
    });
  });

  describe('children', () => {
    test('not render when no children', () => {
      const node = new TreeNode();
      const props: AdvancedTreeViewProps = {};
      renderMe(node, props, wrapper);
      expect(mockDependencies.TreeViewChild).not.toHaveBeenCalled();
    });

    test('render when parent is not expanded', () => {
      const parent = createParentWithChildren(10);
      expect(parent.childCount).toBe(10);
      assert(parent.children !== undefined);
      parent.isExpanded = false;
      const props: AdvancedTreeViewProps = { showRoot: true };
      renderMe(parent, props, wrapper);
      expect(mockDependencies.TreeViewChild).not.toHaveBeenCalled();
    });

    test('render children when parent expanded', () => {
      const parent = createParentWithChildren(10);
      expect(parent.childCount).toBe(10);
      assert(parent.children !== undefined);
      parent.isExpanded = true;
      const props: AdvancedTreeViewProps = {};
      const level = 4;
      renderMe(parent, props, wrapper, level);

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

function renderMe(
  node: TreeNode,
  props: AdvancedTreeViewProps,
  wrapper: ({ children }: PropsWithChildren) => ReactElement,
  level = 1
): HTMLElement {
  const { container } = render(<AdvancedTreeViewNode node={node} level={level} props={props} />, {
    wrapper
  });
  return container;
}

class LazyLoaderMock implements ILazyLoader {
  root: TreeNodeType | undefined;
  async loadChildren(_node: TreeNodeType): Promise<TreeNodeType[] | undefined> {
    return undefined;
  }

  async loadSiblings(_node: TreeNodeType): Promise<TreeNodeType[] | undefined> {
    return undefined;
  }
}

function createParentWithChildren(count: number): TreeNode {
  const parent = new TreeNode();
  parent.label = 'Parent';
  for (let i = 0; i < count; i++) {
    const child = new TreeNode();
    child.label = 'Child ' + i;
    parent.addChild(child);
  }
  return parent;
}
