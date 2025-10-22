import { describe, test, expect, beforeEach, vi, assert } from 'vitest';
import { TreeNode } from './tree-node';
import { CheckboxState } from '../../architecture/base/utilities/types';
import { OnNodeLoadedAction, type TreeNodeAction } from './types';
import { count } from '../../architecture/base/utilities/extensions/generatorUtils';
import { type ILazyLoader } from './i-lazy-loader';
import { type TreeNodeType } from './tree-node-type';
import { sleep } from '../../../tests/tests-utilities/tree-view/list-nodes-stk/list-nodes-sdk-mock';

describe(TreeNode.name, () => {
  let root: TreeNode;
  const rootListener = vi.fn<TreeNodeAction>();

  beforeEach(() => {
    root = new TreeNode();
    root.addTreeNodeListener(rootListener);
  });

  describe('Setters and getters', () => {
    test('should get id', () => {
      expect(root.id.length).toBeGreaterThan(10);
    });

    test('should set and get label', () => {
      const expected = 'Test';
      root.label = expected;
      expect(root.label).toBe(expected);
      expect(rootListener).toHaveBeenCalledOnce();
      expect(rootListener).toHaveBeenLastCalledWith(root);
    });

    test('should set and get bold label', () => {
      for (const expected of [true, false]) {
        root.hasBoldLabel = expected;
        expect(root.hasBoldLabel).toBe(expected);
      }
      expect(rootListener).toHaveBeenCalledTimes(2);
      expect(rootListener).toHaveBeenLastCalledWith(root);
    });

    test('should set and get icon color', () => {
      const expected = '#0099ff';
      root.iconColor = expected;
      expect(root.iconColor).toBe(expected);
      expect(rootListener).toHaveBeenCalledOnce();
      expect(rootListener).toHaveBeenLastCalledWith(root);
    });

    test('should set and get info icon', () => {
      for (const expected of [true, false]) {
        root.hasInfoIcon = expected;
        expect(root.hasInfoIcon).toBe(expected);
      }
      expect(rootListener).toHaveBeenCalledTimes(2);
      expect(rootListener).toHaveBeenLastCalledWith(root);
    });

    test('should set and get selected', () => {
      for (const expected of [true, false]) {
        root.isSelected = expected;
        expect(root.isSelected).toBe(expected);
      }
      expect(rootListener).toHaveBeenCalledTimes(2);
      expect(rootListener).toHaveBeenLastCalledWith(root);
    });

    test('should set and get expanded', () => {
      for (const expected of [true, false]) {
        root.isExpanded = expected;
        expect(root.isExpanded).toBe(expected);
      }
      expect(rootListener).toHaveBeenCalledTimes(2);
      expect(rootListener).toHaveBeenLastCalledWith(root);
    });

    test('should set and get isCheckboxEnabled', () => {
      for (const expected of [false, true]) {
        root.isCheckboxEnabled = expected;
        expect(root.isCheckboxEnabled).toBe(expected);
      }
      expect(rootListener).toHaveBeenCalledTimes(2);
      expect(rootListener).toHaveBeenLastCalledWith(root);
    });

    test('should set and get checkboxState', () => {
      for (const expected of [CheckboxState.All, CheckboxState.Some, CheckboxState.None]) {
        root.checkboxState = expected;
        expect(root.checkboxState).toBe(expected);
      }
      expect(rootListener).toHaveBeenCalledTimes(3);
      expect(rootListener).toHaveBeenLastCalledWith(root);
    });

    test('should set and get needLoadChildren', () => {
      for (const expected of [true, false]) {
        root.needLoadChildren = expected;
        expect(root.needLoadChildren).toBe(expected);
      }
      expect(rootListener).toHaveBeenCalledTimes(2);
      expect(rootListener).toHaveBeenLastCalledWith(root);
    });

    test('should set and get needLoadSiblings', () => {
      for (const expected of [true, false]) {
        root.needLoadSiblings = expected;
        expect(root.needLoadSiblings).toBe(expected);
      }
      expect(rootListener).toHaveBeenCalledTimes(2);
      expect(rootListener).toHaveBeenLastCalledWith(root);
    });

    test('should set and get isLoadingSiblings', () => {
      for (const expected of [true, false]) {
        root.isLoadingSiblings = expected;
        expect(root.isLoadingSiblings).toBe(expected);
      }
      expect(rootListener).toHaveBeenCalledTimes(2);
      expect(rootListener).toHaveBeenLastCalledWith(root);
    });
  });

  describe('Parent and children', () => {
    test('should not be parent', () => {
      expect(root.isParent).toBe(false);
    });

    test('should not have parent', () => {
      expect(root.parent).toBeUndefined();
    });

    test('should be parent', () => {
      addChildren(root, true);
      expect(root.isParent).toBe(true);
    });

    test('should have parent', () => {
      addChildren(root, true);
      const grandChild = getLastGrandChild(root);
      assert(grandChild !== undefined);
      expect(grandChild.parent).toBeDefined();
    });

    test('should be parent if need to load children', () => {
      root.needLoadChildren = true;
      expect(root.isParent).toBe(true);
    });

    test('should be root', () => {
      addChildren(root, true);
      const grandChild = getLastGrandChild(root);
      assert(grandChild !== undefined);
      expect(grandChild.getRoot()).toBe(root);
    });

    test('should add child node', () => {
      // Arrange
      const child = new TreeNode();
      expect(root.hasChild(child)).toBe(false);

      // Act
      root.addChild(child);

      // Assert
      expect(rootListener).toHaveBeenCalledTimes(1);
      expect(rootListener).toHaveBeenLastCalledWith(root);
      assert(root.children !== undefined);
      expect(child.parent).toBe(root);
      expect(root.children[0]).toBe(child);
    });

    test('should insert child node', () => {
      // Arrange
      const addedChild = new TreeNode();
      const insertedChild = new TreeNode();
      root.addChild(addedChild);
      rootListener.mockClear();

      // Act
      root.insertChild(0, insertedChild);

      // Assert
      expect(rootListener).toHaveBeenCalledTimes(1);
      expect(rootListener).toHaveBeenLastCalledWith(root);
      expect(addedChild.parent).toBe(root);
      assert(root.children !== undefined);
      expect(root.children[0]).toBe(insertedChild);
      expect(root.children[1]).toBe(addedChild);
    });

    test('should have child', () => {
      const child = new TreeNode();
      expect(root.hasChild(child)).toBe(false);
      root.addChild(child);
      expect(root.hasChild(child)).toBe(true);
    });
  });

  describe('equal', () => {
    test('should be equal', () => {
      expect(root.areEqual(root)).toBe(true);
    });

    test('should not be equal', () => {
      expect(root.areEqual(new TreeNode())).toBe(false);
    });
  });

  describe('misc hierarchy methods', () => {
    test('should get selected nodes', () => {
      addChildren(root);
      assert(root.children !== undefined);
      root.isSelected = true;
      root.children[1].isSelected = true;
      root.children[2].isSelected = true;
      expect(root.getSelectedNodes()).toHaveLength(3);
    });

    test('should get deselect all nodes', () => {
      addChildren(root);
      assert(root.children !== undefined);
      root.isSelected = true;
      root.children[1].isSelected = true;
      root.children[2].isSelected = true;

      root.deselectAll();
      expect(root.getSelectedNodes()).toHaveLength(0);
    });

    test('should get all checked nodes', () => {
      addChildren(root);
      assert(root.children !== undefined);
      root.checkboxState = CheckboxState.All;
      root.children[0].checkboxState = CheckboxState.All;
      root.children[2].checkboxState = CheckboxState.All;
      expect(root.getCheckedNodes()).toHaveLength(3);
    });

    test('should expand parent', () => {
      addChildren(root);
      assert(root.children !== undefined);
      expect(root.isExpanded).toBe(false);
      root.children[1].expandAllAncestors();
      expect(root.isExpanded).toBe(true);
    });
  });

  describe('Iterators', () => {
    test('should get all children', () => {
      addChildren(root, true);
      count(root.getChildren());
      expect(count(root.getChildren())).toBe(CHILDREN_COUNT);
    });

    test('should get all children by type', () => {
      addChildren(root, true);
      expect(count(root.getChildrenByType(TreeNode))).toBe(CHILDREN_COUNT);
    });

    test('should get all descendants', () => {
      addChildren(root, true);
      expect(count(root.getDescendants())).toBe(CHILDREN_COUNT * (1 + GRAND_CHILDREN_COUNT));
    });

    test('should get all descendants by type', () => {
      addChildren(root, true);
      expect(count(root.getDescendantsByType(TreeNode))).toBe(
        CHILDREN_COUNT * (1 + GRAND_CHILDREN_COUNT)
      );
    });

    test('should get all expanded descendants', () => {
      addChildren(root, true);
      assert(root.children !== undefined);
      root.isExpanded = true;
      root.children[0].isExpanded = true;
      root.children[2].isExpanded = true;
      expect(count(root.getExpandedDescendants())).toBe(CHILDREN_COUNT + 2 * GRAND_CHILDREN_COUNT);
    });

    test('should get this and all descendants', () => {
      addChildren(root, true);
      expect(count(root.getThisAndDescendants())).toBe(
        1 + CHILDREN_COUNT * (1 + GRAND_CHILDREN_COUNT)
      );
    });

    test('should get this and all descendants by type', () => {
      addChildren(root, true);
      expect(count(root.getThisAndDescendantsByType(TreeNode))).toBe(
        1 + CHILDREN_COUNT * (1 + GRAND_CHILDREN_COUNT)
      );
    });

    test('should get ancestors', () => {
      addChildren(root, true);
      const grandChild = getLastGrandChild(root);
      assert(grandChild !== undefined);
      expect(count(grandChild.getAncestors())).toBe(2);
    });

    test('should get ancestors by type', () => {
      addChildren(root, true);
      const grandChild = getLastGrandChild(root);
      assert(grandChild !== undefined);
      expect(count(grandChild.getAncestorsByType(TreeNode))).toBe(2);
    });

    test('should get this and ancestors by type', () => {
      addChildren(root, true);
      const grandChild = getLastGrandChild(root);
      assert(grandChild !== undefined);
      expect(count(grandChild.getThisAndAncestorsByType(TreeNode))).toBe(3);
    });
  });

  describe('Lazy loading', () => {
    test('should lazy load children', async () => {
      root.needLoadChildren = true;

      const lazyLoader = new LazyLoaderMock();
      await root.loadChildren(lazyLoader);

      expect(root.childCount).toBe(3); // 4 new children
      expect(root.needLoadChildren).toBe(false); // Change to false

      // Notified: isLoadingChildren (on/off) needLoadChildren(on/off) + 3 children = 7
      expect(rootListener).toHaveBeenCalledTimes(7);
      expect(rootListener).toHaveBeenLastCalledWith(root);
      expect(lazyLoader.onNodeLoaded).toHaveBeenCalledTimes(3); // 3 children
    });

    test('should not lazy load children when the mock is empty', async () => {
      root.needLoadChildren = true;

      await root.loadChildren(new EmptyLazyLoaderMock());

      expect(root.childCount).toBe(0); // 4 new children
      expect(root.needLoadChildren).toBe(true); // Still true

      // Notified: isLoadingChildren (on/off) needLoadChildren(on) = 3
      expect(rootListener).toHaveBeenCalledTimes(3);
      expect(rootListener).toHaveBeenLastCalledWith(root);
    });

    test('should lazy load siblings', async () => {
      addChildren(root);
      rootListener.mockClear();
      const child = getLastChild(root);
      assert(child !== undefined);

      const childListener = vi.fn<TreeNodeAction>();
      child.addTreeNodeListener(childListener);
      const oldChildCount = root.childCount;
      child.needLoadSiblings = true;

      const lazyLoader = new LazyLoaderMock();
      await child.loadSiblings(lazyLoader);

      expect(root.childCount - oldChildCount).toBe(4); // 4 new children
      expect(child.needLoadSiblings).toBe(false); // Change to false

      expect(rootListener).toHaveBeenCalledTimes(4); // 4 children added
      expect(rootListener).toHaveBeenLastCalledWith(root);

      // Notified: isLoadingSiblings (on/off) needLoadSiblings(on/off)
      expect(childListener).toHaveBeenCalledTimes(4);
      expect(childListener).toHaveBeenLastCalledWith(child);
      expect(lazyLoader.onNodeLoaded).toHaveBeenCalledTimes(4); // 4 children
    });

    test('should not lazy load siblings when the mock is empty', async () => {
      addChildren(root);
      rootListener.mockClear();
      const child = getLastChild(root);
      assert(child !== undefined);

      const childListener = vi.fn<TreeNodeAction>();
      child.addTreeNodeListener(childListener);
      const oldChildCount = root.childCount;
      child.needLoadSiblings = true;

      await child.loadSiblings(new EmptyLazyLoaderMock());

      expect(root.childCount - oldChildCount).toBe(0); // No new children
      expect(child.needLoadSiblings).toBe(true); // Still true
      expect(rootListener).toHaveBeenCalledTimes(0); // No new children added

      // Notified: isLoadingSiblings (on/off) needLoadSiblings(on)
      expect(childListener).toHaveBeenCalledTimes(3);
      expect(childListener).toHaveBeenLastCalledWith(child);
    });

    test('get children with lazy loader', async () => {
      root.needLoadChildren = true;

      // Since we have to await for the children to load, we need to test that
      // nothing is return yet
      const childrenCount = count(root.getChildren(new LazyLoaderMock()));
      expect(childrenCount).toBe(0);
      expect(root.children).toBeUndefined();

      // Wait a tick for the children to load
      await sleep(1);

      // Now the 3 children should be loaded
      expect(root.children).toHaveLength(3);

      // Notified: isLoadingChildren (on/off) needLoadChildren(on/off) + 3 children = 7
      expect(rootListener).toHaveBeenCalledTimes(7);
      expect(rootListener).toHaveBeenLastCalledWith(root);
    });
  });
});

const CHILDREN_COUNT = 5;
const GRAND_CHILDREN_COUNT = 6;

function addChildren(
  parent: TreeNode,
  alsoAddGrandChildren = false,
  count: number = CHILDREN_COUNT
): void {
  for (let i = 0; i < count; i++) {
    const child = new TreeNode();
    child.label = 'Child ' + i;
    parent.addChild(child);

    if (!alsoAddGrandChildren) {
      continue;
    }
    for (let j = 0; j < GRAND_CHILDREN_COUNT; j++) {
      const grandChild = new TreeNode();
      grandChild.label = 'GrandChild ' + j;
      child.addChild(grandChild);
    }
  }
}

function getLastChild(node: TreeNode): TreeNode | undefined {
  const { children } = node;
  if (children === undefined || children.length === 0) {
    return undefined;
  }
  return children[children.length - 1];
}

function getLastGrandChild(node: TreeNode): TreeNode | undefined {
  const lastChild = getLastChild(node);
  return lastChild === undefined ? undefined : getLastChild(lastChild);
}

class LazyLoaderMock implements ILazyLoader {
  root: TreeNodeType | undefined;

  async loadChildren(_node: TreeNodeType): Promise<TreeNodeType[] | undefined> {
    return [new TreeNode(), new TreeNode(), new TreeNode()]; // 3 children
  }

  async loadSiblings(_node: TreeNodeType): Promise<TreeNodeType[] | undefined> {
    return [new TreeNode(), new TreeNode(), new TreeNode(), new TreeNode()]; // 4 siblings
  }

  onNodeLoaded: OnNodeLoadedAction = vi.fn<OnNodeLoadedAction>();
}

class EmptyLazyLoaderMock implements ILazyLoader {
  root: TreeNodeType | undefined;

  async loadChildren(_node: TreeNodeType): Promise<TreeNodeType[] | undefined> {
    return undefined;
  }

  async loadSiblings(_node: TreeNodeType): Promise<TreeNodeType[] | undefined> {
    return undefined;
  }
}
