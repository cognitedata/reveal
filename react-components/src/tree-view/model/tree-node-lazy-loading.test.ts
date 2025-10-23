import { describe, test, expect, beforeEach, vi, assert } from 'vitest';
import { TreeNode } from './tree-node';
import { type OnNodeLoadedAction, type TreeNodeAction } from './types';
import { count } from '../../architecture/base/utilities/extensions/generatorUtils';
import { type ILazyLoader } from './i-lazy-loader';
import { type TreeNodeType } from './tree-node-type';
import { sleep } from '../../../tests/tests-utilities/tree-view/list-nodes-stk/list-nodes-sdk-mock';
import { addChildren, getLastChild } from './tree-node.test';

describe(TreeNode.name + ' (Lazy loading)', () => {
  let root: TreeNode;
  const rootListener = vi.fn<TreeNodeAction>();

  beforeEach(() => {
    root = new TreeNode();
    root.addTreeNodeListener(rootListener);
  });

  test('should lazy load children', async () => {
    root.needLoadChildren = true;

    const lazyLoader = new LazyLoaderMock();
    await root.loadChildren(lazyLoader);

    expect(root.childCount).toBe(3); // initially has 3 children
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

  test('should not lazy load siblings on root', async () => {
    root.needLoadSiblings = true;
    const lazyLoader = new LazyLoaderMock();
    rootListener.mockClear();
    await root.loadSiblings(lazyLoader);

    // Check that nothings has changed
    expect(rootListener).toHaveBeenCalledTimes(0);
    expect(lazyLoader.onNodeLoaded).toHaveBeenCalledTimes(0);
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
