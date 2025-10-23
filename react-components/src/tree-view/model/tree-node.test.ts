import { describe, test, expect, beforeEach, vi, assert } from 'vitest';
import { TreeNode } from './tree-node';
import { CheckboxState } from '../../architecture/base/utilities/types';
import { type TreeNodeAction } from './types';
import { count } from '../../architecture/base/utilities/extensions/generatorUtils';

describe(TreeNode.name, () => {
  let root: TreeNode;
  const rootListener = vi.fn<TreeNodeAction>();

  beforeEach(() => {
    root = new TreeNode();
    root.addTreeNodeListener(rootListener);
  });

  describe('Event listener', () => {
    test('Should add and remove event listener', () => {
      const listener = vi.fn<TreeNodeAction>();

      // Add the event listener, set the label and check that the listener was called
      root.addTreeNodeListener(listener);
      root.label = 'Testing';
      expect(listener).toHaveBeenCalledOnce();

      // Remove the event listener, set the label and check that the listener was not called
      listener.mockClear();
      root.removeTreeNodeListener(listener);
      root.label = 'Testing more';
      expect(listener).not.toHaveBeenCalled();
    });
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

    test('should set and get isLoadingChildren', () => {
      for (const expected of [true, false]) {
        root.isLoadingChildren = expected;
        expect(root.isLoadingChildren).toBe(expected);
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
    test('should not be parent when it has no children', () => {
      expect(root.isParent).toBe(false);
    });

    test('should not have parent', () => {
      expect(root.parent).toBeUndefined();
    });

    test('should be parent when it has children', () => {
      addChildren(root, true);
      expect(root.isParent).toBe(true);
    });

    test('child should have parent', () => {
      addChildren(root, true);
      const grandChild = getLastGrandChild(root);
      assert(grandChild !== undefined);
      expect(grandChild.parent).toBeDefined();
    });

    test('should be parent if need to load children', () => {
      root.needLoadChildren = true;
      expect(root.isParent).toBe(true);
    });

    test('getting root of grandchild should return correct root', () => {
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
    test('should be equal to itself', () => {
      expect(root.areEqual(root)).toBe(true);
    });

    test('should not be equal to a new instance', () => {
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
});

const CHILDREN_COUNT = 5;
const GRAND_CHILDREN_COUNT = 6;

export function addChildren(
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

export function getLastChild(node: TreeNode): TreeNode | undefined {
  const { children } = node;
  if (children === undefined || children.length === 0) {
    return undefined;
  }
  return children[children.length - 1];
}

export function getLastGrandChild(node: TreeNode): TreeNode | undefined {
  const lastChild = getLastChild(node);
  return lastChild === undefined ? undefined : getLastChild(lastChild);
}
