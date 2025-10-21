import { describe, test, expect, beforeEach, vi } from 'vitest';
import { TreeNode } from '#test-utils/tree-view/nodes/tree-node';
import { CheckboxState } from '../../architecture/base/utilities/types';
import { type TreeNodeAction } from './types';

describe(TreeNode.name, () => {
  let node: TreeNode;
  const updateListener = vi.fn<TreeNodeAction>();

  beforeEach(() => {
    node = new TreeNode();
    node.addTreeNodeListener(updateListener);
  });

  test('should get id', () => {
    expect(node.id.length).toBeGreaterThan(10);
  });

  test('should set and get label', () => {
    const expected = 'Test';
    node.label = expected;
    expect(node.label).toBe(expected);
    expect(updateListener).toHaveBeenCalledOnce();
    expect(updateListener).toHaveBeenLastCalledWith(node);
  });

  test('should set and get bold label', () => {
    for (const expected of [true, false]) {
      node.hasBoldLabel = expected;
      expect(node.hasBoldLabel).toBe(expected);
    }
    expect(updateListener).toHaveBeenCalledTimes(2);
    expect(updateListener).toHaveBeenLastCalledWith(node);
  });

  test('should set and get icon color', () => {
    const expected = '#0099ff';
    node.iconColor = expected;
    expect(node.iconColor).toBe(expected);
    expect(updateListener).toHaveBeenCalledOnce();
    expect(updateListener).toHaveBeenLastCalledWith(node);
  });

  test('should set and get info icon', () => {
    for (const expected of [true, false]) {
      node.hasInfoIcon = expected;
      expect(node.hasInfoIcon).toBe(expected);
    }
    expect(updateListener).toHaveBeenCalledTimes(2);
    expect(updateListener).toHaveBeenLastCalledWith(node);
  });

  test('should set and get selected', () => {
    for (const expected of [true, false]) {
      node.isSelected = expected;
      expect(node.isSelected).toBe(expected);
    }
    expect(updateListener).toHaveBeenCalledTimes(2);
    expect(updateListener).toHaveBeenLastCalledWith(node);
  });

  test('should set and get expanded', () => {
    for (const expected of [true, false]) {
      node.isExpanded = expected;
      expect(node.isExpanded).toBe(expected);
    }
    expect(updateListener).toHaveBeenCalledTimes(2);
    expect(updateListener).toHaveBeenLastCalledWith(node);
  });

  test('should set and get isCheckboxEnabled', () => {
    for (const expected of [false, true]) {
      node.isCheckboxEnabled = expected;
      expect(node.isCheckboxEnabled).toBe(expected);
    }
    expect(updateListener).toHaveBeenCalledTimes(2);
    expect(updateListener).toHaveBeenLastCalledWith(node);
  });

  test('should set and get checkboxState', () => {
    for (const expected of [CheckboxState.All, CheckboxState.Some, CheckboxState.None]) {
      node.checkboxState = expected;
      expect(node.checkboxState).toBe(expected);
    }
    expect(updateListener).toHaveBeenCalledTimes(3);
    expect(updateListener).toHaveBeenLastCalledWith(node);
  });

  test('should set and get needLoadChildren', () => {
    for (const expected of [true, false]) {
      node.needLoadChildren = expected;
      expect(node.needLoadChildren).toBe(expected);
    }
    expect(updateListener).toHaveBeenCalledTimes(2);
    expect(updateListener).toHaveBeenLastCalledWith(node);
  });

  test('should set and get needLoadSiblings', () => {
    for (const expected of [true, false]) {
      node.needLoadSiblings = expected;
      expect(node.needLoadSiblings).toBe(expected);
    }
    expect(updateListener).toHaveBeenCalledTimes(2);
    expect(updateListener).toHaveBeenLastCalledWith(node);
  });

  test('should set and get isLoadingSiblings', () => {
    for (const expected of [true, false]) {
      node.isLoadingSiblings = expected;
      expect(node.isLoadingSiblings).toBe(expected);
    }
    expect(updateListener).toHaveBeenCalledTimes(2);
    expect(updateListener).toHaveBeenLastCalledWith(node);
  });

  test('should not be parent', () => {
    expect(node.isParent).toBe(false);
    expect(node.parent).toBe(undefined);
  });

  test('should be parent if need to load children', () => {
    node.needLoadChildren = true;
    expect(node.isParent).toBe(true);
  });

  test('should not be parent', () => {
    expect(node.isParent).toBe(false);
    expect(node.parent).toBe(undefined);
  });

  test('should be root', () => {
    expect(node.getRoot()).toBe(node);
  });

  test('should be equal', () => {
    expect(node.areEqual(node)).toBe(true);
  });

  test('should not be equal', () => {
    expect(node.areEqual(new TreeNode())).toBe(false);
  });
});
