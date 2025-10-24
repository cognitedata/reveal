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

    const lazyLoader = new LazyLoaderMock(CHILDREN_COUNT, 0);
    await root.loadChildren(lazyLoader);

    expect(root.childCount).toBe(CHILDREN_COUNT);
    expect(root.needLoadChildren).toBe(false); // Change to false

    expect(rootListener).toHaveBeenCalledTimes(NOTIFICATIONS.CHILDREN_LOAD_SUCCESS);
    expect(rootListener).toHaveBeenLastCalledWith(root);
    expect(lazyLoader.onNodeLoaded).toHaveBeenCalledTimes(CHILDREN_COUNT);
  });

  test('should not lazy load children when the mock is empty', async () => {
    root.needLoadChildren = true;

    const lazyLoader = new LazyLoaderMock(0, 0);
    await root.loadChildren(lazyLoader);

    expect(root.childCount).toBe(0);
    expect(root.needLoadChildren).toBe(true); // Still true

    expect(rootListener).toHaveBeenCalledTimes(NOTIFICATIONS.CHILDREN_LOAD_EMPTY);
    expect(rootListener).toHaveBeenLastCalledWith(root);
  });

  test('should not lazy load siblings on root', async () => {
    root.needLoadSiblings = true;
    const lazyLoader = new LazyLoaderMock(0, SIBLINGS_COUNT);
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

    const lazyLoader = new LazyLoaderMock(0, SIBLINGS_COUNT);
    await child.loadSiblings(lazyLoader);

    expect(root.childCount - oldChildCount).toBe(SIBLINGS_COUNT);
    expect(child.needLoadSiblings).toBe(false); // Change to false

    expect(rootListener).toHaveBeenCalledTimes(SIBLINGS_COUNT);
    expect(rootListener).toHaveBeenLastCalledWith(root);

    expect(childListener).toHaveBeenCalledTimes(NOTIFICATIONS.SIBLINGS_LOAD_SUCCESS);
    expect(childListener).toHaveBeenLastCalledWith(child);
    expect(lazyLoader.onNodeLoaded).toHaveBeenCalledTimes(SIBLINGS_COUNT);
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

    const lazyLoader = new LazyLoaderMock(0, 0);
    await child.loadSiblings(lazyLoader);

    expect(root.childCount - oldChildCount).toBe(0); // No new children
    expect(child.needLoadSiblings).toBe(true); // Still true
    expect(rootListener).toHaveBeenCalledTimes(0); // No new children added

    expect(childListener).toHaveBeenCalledTimes(NOTIFICATIONS.SIBLINGS_LOAD_EMPTY);
    expect(childListener).toHaveBeenLastCalledWith(child);
  });

  test('get children with lazy loader', async () => {
    root.needLoadChildren = true;
    const loader = new LazyLoaderMock(CHILDREN_COUNT, 0);

    // Since we have to await for the children to load, we need to test that
    // nothing is return yet
    const childrenCount = count(root.getChildren(loader));
    expect(childrenCount).toBe(0);
    expect(root.children).toBeUndefined();

    // Wait a tick for the children to load
    await sleep(1);

    // Now the children should be loaded
    expect(root.children).toHaveLength(CHILDREN_COUNT);
    expect(rootListener).toHaveBeenCalledTimes(NOTIFICATIONS.CHILDREN_LOAD_SUCCESS);
    expect(rootListener).toHaveBeenLastCalledWith(root);
  });
});

const CHILDREN_COUNT = 3;
const SIBLINGS_COUNT = 4;

const NOTIFICATIONS = {
  CHILDREN_LOAD_SUCCESS: 7, // isLoadingChildren (on/off) + needLoadChildren(on/off) + 3 children
  CHILDREN_LOAD_EMPTY: 3, // isLoadingChildren (on/off) + needLoadChildren(on)
  SIBLINGS_LOAD_SUCCESS: 4, // isLoadingSiblings (on/off) + needLoadSiblings(on/off)
  SIBLINGS_LOAD_EMPTY: 3 // isLoadingSiblings (on/off) + needLoadSiblings(on)
} as const;

class LazyLoaderMock implements ILazyLoader {
  root: TreeNodeType | undefined;

  private readonly _childrenCount: number;
  private readonly _siblingsCount: number;

  constructor(childrenCount: number, siblingsCount: number) {
    this._childrenCount = childrenCount;
    this._siblingsCount = siblingsCount;
  }

  async loadChildren(_node: TreeNodeType): Promise<TreeNodeType[] | undefined> {
    return Array.from({ length: this._childrenCount }, () => new TreeNode());
  }

  async loadSiblings(_node: TreeNodeType): Promise<TreeNodeType[] | undefined> {
    return Array.from({ length: this._siblingsCount }, () => new TreeNode());
  }

  onNodeLoaded: OnNodeLoadedAction = vi.fn<OnNodeLoadedAction>();
}
