import { type ReactElement, type PropsWithChildren } from 'react';
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

describe(AdvancedTreeView.name, () => {
  const mockDependencies = getMocksByDefaultDependencies(defaultAdvancedTreeViewDependencies);
  const wrapper = ({ children }: PropsWithChildren): ReactElement => (
    <CustomAdvancedTreeViewContext.Provider value={mockDependencies}>
      {children}
    </CustomAdvancedTreeViewContext.Provider>
  );

  describe('root', () => {
    test('render without root', () => {
      const props: AdvancedTreeViewProps = {};
      renderMe(props, wrapper);
      expect(mockDependencies.AdvancedTreeViewNode).not.toHaveBeenCalled();
      expect(mockDependencies.Loader).toHaveBeenCalled();
    });

    test('render root with show root set to true', () => {
      const root = new TreeNode();
      const props: AdvancedTreeViewProps = { root, showRoot: true };
      renderMe(props, wrapper);
      expect(mockDependencies.AdvancedTreeViewNode).toHaveBeenCalled();

      expect(mockDependencies.AdvancedTreeViewNode).toHaveBeenCalledWith(
        { node: root, level: 0, props },
        expect.anything()
      );
      expect(mockDependencies.Loader).not.toHaveBeenCalled();
    });

    test('render root with show root set to false', () => {
      const root = new TreeNode();
      const props: AdvancedTreeViewProps = { root, showRoot: false };
      renderMe(props, wrapper);
      expect(mockDependencies.AdvancedTreeViewNode).not.toHaveBeenCalled();
      expect(mockDependencies.Loader).not.toHaveBeenCalled();
    });

    test('render root with show root set to true', () => {
      const root = createParentWithChildren(10);
      expect(root.childCount).toBe(10);
      assert(root.children !== undefined);

      const props: AdvancedTreeViewProps = { root, showRoot: false };
      renderMe(props, wrapper);
      expect(mockDependencies.AdvancedTreeViewNode).toHaveBeenCalled();

      for (let index = 0; index < root.childCount; index++) {
        expect(mockDependencies.AdvancedTreeViewNode).toHaveBeenNthCalledWith(
          index + 1,
          { node: root.children[index], level: 0, props },
          expect.anything()
        );
      }

      expect(mockDependencies.Loader).not.toHaveBeenCalled();
    });

    test('render root with show root set to true', () => {
      const root = createParentWithChildren(10);
      root.isExpanded = true;
      expect(root.childCount).toBe(10);
      assert(root.children !== undefined);

      const props: AdvancedTreeViewProps = { root, showRoot: false };
      renderMe(props, wrapper);
      expect(mockDependencies.AdvancedTreeViewNode).toHaveBeenCalled();

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

function renderMe(
  props: AdvancedTreeViewProps,
  wrapper: ({ children }: PropsWithChildren) => ReactElement
): HTMLElement {
  const { container } = render(<AdvancedTreeView {...props} />, {
    wrapper
  });
  return container;
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
