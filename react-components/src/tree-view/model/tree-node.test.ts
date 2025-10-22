import { describe, test, expect, beforeEach, vi, assert } from 'vitest';
import { TreeNode } from './tree-node';
import { CheckboxState } from '../../architecture/base/utilities/types';
import { type TreeNodeAction } from './types';
import { count } from '../../architecture/base/utilities/extensions/generatorUtils';
import { type ILazyLoader } from './i-lazy-loader';
import { type TreeNodeType } from './tree-node-type';
import { sleep } from '../../../tests/tests-utilities/tree-view/list-nodes-stk/list-nodes-sdk-mock';

describe(TreeNode.name, () => {
  let root: TreeNode;
  const updateListener = vi.fn<TreeNodeAction>();

  beforeEach(() => {
    root = new TreeNode();
    root.addTreeNodeListener(updateListener);
  });

  describe('Setters and getters', () => {
    test('should get id', () => {
      expect(root.id.length).toBeGreaterThan(10);
    });

    test('should set and get label', () => {
      const expected = 'Test';
      root.label = expected;
      expect(root.label).toBe(expected);
      expect(updateListener).toHaveBeenCalledOnce();
      expect(updateListener).toHaveBeenLastCalledWith(root);
    });

    test('should set and get bold label', () => {
      for (const expected of [true, false]) {
        root.hasBoldLabel = expected;
        expect(root.hasBoldLabel).toBe(expected);
      }
      expect(updateListener).toHaveBeenCalledTimes(2);
      expect(updateListener).toHaveBeenLastCalledWith(root);
    });

    test('should set and get icon color', () => {
      const expected = '#0099ff';
      root.iconColor = expected;
      expect(root.iconColor).toBe(expected);
      expect(updateListener).toHaveBeenCalledOnce();
      expect(updateListener).toHaveBeenLastCalledWith(root);
    });

    test('should set and get info icon', () => {
      for (const expected of [true, false]) {
        root.hasInfoIcon = expected;
        expect(root.hasInfoIcon).toBe(expected);
      }
      expect(updateListener).toHaveBeenCalledTimes(2);
      expect(updateListener).toHaveBeenLastCalledWith(root);
    });

    test('should set and get selected', () => {
      for (const expected of [true, false]) {
        root.isSelected = expected;
        expect(root.isSelected).toBe(expected);
      }
      expect(updateListener).toHaveBeenCalledTimes(2);
      expect(updateListener).toHaveBeenLastCalledWith(root);
    });

    test('should set and get expanded', () => {
      for (const expected of [true, false]) {
        root.isExpanded = expected;
        expect(root.isExpanded).toBe(expected);
      }
      expect(updateListener).toHaveBeenCalledTimes(2);
      expect(updateListener).toHaveBeenLastCalledWith(root);
    });

    test('should set and get isCheckboxEnabled', () => {
      for (const expected of [false, true]) {
        root.isCheckboxEnabled = expected;
        expect(root.isCheckboxEnabled).toBe(expected);
      }
      expect(updateListener).toHaveBeenCalledTimes(2);
      expect(updateListener).toHaveBeenLastCalledWith(root);
    });

    test('should set and get checkboxState', () => {
      for (const expected of [CheckboxState.All, CheckboxState.Some, CheckboxState.None]) {
        root.checkboxState = expected;
        expect(root.checkboxState).toBe(expected);
      }
      expect(updateListener).toHaveBeenCalledTimes(3);
      expect(updateListener).toHaveBeenLastCalledWith(root);
    });

    test('should set and get needLoadChildren', () => {
      for (const expected of [true, false]) {
        root.needLoadChildren = expected;
        expect(root.needLoadChildren).toBe(expected);
      }
      expect(updateListener).toHaveBeenCalledTimes(2);
      expect(updateListener).toHaveBeenLastCalledWith(root);
    });

    test('should set and get needLoadSiblings', () => {
      for (const expected of [true, false]) {
        root.needLoadSiblings = expected;
        expect(root.needLoadSiblings).toBe(expected);
      }
      expect(updateListener).toHaveBeenCalledTimes(2);
      expect(updateListener).toHaveBeenLastCalledWith(root);
    });

    test('should set and get isLoadingSiblings', () => {
      for (const expected of [true, false]) {
        root.isLoadingSiblings = expected;
        expect(root.isLoadingSiblings).toBe(expected);
      }
      expect(updateListener).toHaveBeenCalledTimes(2);
      expect(updateListener).toHaveBeenLastCalledWith(root);
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
      expect(updateListener).toHaveBeenCalledTimes(1);
      expect(updateListener).toHaveBeenLastCalledWith(root);
      assert(root.children !== undefined);
      expect(child.parent).toBe(root);
      expect(root.children[0]).toBe(child);
    });

    test('should insert child node', () => {
      // Arrange
      const addedChild = new TreeNode();
      const insertedChild = new TreeNode();
      root.addChild(addedChild);
      updateListener.mockClear();

      // Act
      root.insertChild(0, insertedChild);

      // Assert
      expect(updateListener).toHaveBeenCalledTimes(1);
      expect(updateListener).toHaveBeenLastCalledWith(root);
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
    expect(updateListener).toHaveBeenCalledTimes(7);
    expect(updateListener).toHaveBeenLastCalledWith(root);
  });

  test('get children with empty lazy loader', async () => {
    root.needLoadChildren = true;

    // Since we have to await for the children to load, we need to test that
    // nothing is return yet
    const childrenCount = count(root.getChildren(new EmptyLazyLoaderMock()));
    expect(childrenCount).toBe(0);
    expect(root.children).toBeUndefined();

    // Wait a tick for the children to load
    await sleep(1);

    // Now the 0 children should be loaded
    expect(childrenCount).toBe(0);
    expect(root.children).toBeUndefined();

    // Notified: isLoadingChildren (on/off) needLoadChildren(on/off) = 4
    expect(updateListener).toHaveBeenCalledTimes(4);
    expect(updateListener).toHaveBeenLastCalledWith(root);
  });

  test('should load siblings', async () => {
    root.needLoadChildren = true;
    addChildren(root, true);
    const node = getLastGrandChild(root);

    assert(node !== undefined);
    const oldChildCount = node.parent?.children?.length ?? 0;
    await node.loadSiblings(new LazyLoaderMock());
    const newChildCount = node.parent?.children?.length ?? 0;

    expect(newChildCount - oldChildCount).toBe(4);

    // Notified: isLoadingSiblings (on/off) needLoadSiblings(on/off) + 4 children = 8
  });
});

const CHILDREN_COUNT = 5;
const GRAND_CHILDREN_COUNT = 6;

function addChildren(
  parent: TreeNode,
  addGrandChildren = false,
  count: number = CHILDREN_COUNT
): void {
  for (let i = 0; i < count; i++) {
    const child = new TreeNode();
    child.label = 'Child ' + i;
    parent.addChild(child);

    if (!addGrandChildren) {
      continue;
    }
    for (let j = 0; j < GRAND_CHILDREN_COUNT; j++) {
      const grandChild = new TreeNode();
      grandChild.label = 'GrandChild ' + j;
      child.addChild(grandChild);
    }
  }
}

function getLastGrandChild(node: TreeNode): TreeNode | undefined {
  const { children } = node;
  if (children === undefined) {
    return undefined;
  }
  const child = children[children.length - 1];
  if (child === undefined) {
    return undefined;
  }
  const grandChildren = child.children;
  if (grandChildren === undefined) {
    return undefined;
  }
  return grandChildren[grandChildren.length - 1];
}

class LazyLoaderMock implements ILazyLoader {
  root: TreeNodeType | undefined;

  async loadChildren(_node: TreeNodeType): Promise<TreeNodeType[] | undefined> {
    return [new TreeNode(), new TreeNode(), new TreeNode()];
  }

  async loadSiblings(_node: TreeNodeType): Promise<TreeNodeType[] | undefined> {
    return [new TreeNode(), new TreeNode(), new TreeNode(), new TreeNode()];
  }
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
