/*!
 * Copyright 2021 Cognite AS
 */

import { IndexSet } from '@reveal/utilities';

import { NodeAppearance } from '../NodeAppearance';
import { TreeIndexNodeCollection } from './TreeIndexNodeCollection';
import { NodeAppearanceProvider } from './NodeAppearanceProvider';
import { NodeCollectionBase, SerializedNodeCollection } from './NodeCollectionBase';
import { NodeOutlineColor } from '../NodeAppearance';

describe('NodeAppearanceProvider', () => {
  let provider: NodeAppearanceProvider;

  beforeEach(() => {
    provider = new NodeAppearanceProvider();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('applyStyles() when there are no added sets does nothing', () => {
    const applyCb = jest.fn();

    provider.applyStyles(applyCb);

    expect(applyCb).not.toBeCalled();
  });

  test('applyStyles() applies styles in the order they were added', () => {
    const applyCb = jest.fn();
    const nodeCollection1 = new TreeIndexNodeCollection(new IndexSet([1, 2, 3]));
    const style1: NodeAppearance = { visible: false };
    const nodeCollection2 = new TreeIndexNodeCollection(new IndexSet([2, 3, 4]));
    const style2: NodeAppearance = { visible: true };
    provider.assignStyledNodeCollection(nodeCollection1, style1);
    provider.assignStyledNodeCollection(nodeCollection2, style2);

    provider.applyStyles(applyCb);

    expect(applyCb).toBeCalledTimes(2);
    expect(applyCb.mock.calls[0]).toEqual([nodeCollection1.getIndexSet(), style1]);
    expect(applyCb.mock.calls[1]).toEqual([nodeCollection2.getIndexSet(), style2]);
  });

  test('applyStyles() is not invoced for removed style set', () => {
    const applyCb = jest.fn();
    const nodeCollection1 = new TreeIndexNodeCollection(new IndexSet([1, 2, 3]));
    const style1: NodeAppearance = { visible: false };
    const nodeCollection2 = new TreeIndexNodeCollection(new IndexSet([2, 3, 4]));
    const style2: NodeAppearance = { visible: true };
    provider.assignStyledNodeCollection(nodeCollection1, style1);
    provider.assignStyledNodeCollection(nodeCollection2, style2);

    provider.unassignStyledNodeCollection(nodeCollection2);
    provider.applyStyles(applyCb);

    expect(applyCb).toBeCalledTimes(1);
    expect(applyCb).toBeCalledWith(nodeCollection1.getIndexSet(), style1);
  });

  test('add/change/remove style triggers changed-listener', () => {
    const listener = jest.fn();
    const nodeCollection = new TreeIndexNodeCollection(new IndexSet([1, 2, 3]));
    provider.on('changed', listener);

    provider.assignStyledNodeCollection(nodeCollection, {});
    expect(listener).toBeCalledTimes(1);

    provider.assignStyledNodeCollection(nodeCollection, { visible: false });
    expect(listener).toBeCalledTimes(2);

    provider.unassignStyledNodeCollection(nodeCollection);
    expect(listener).toBeCalledTimes(3);
  });

  test('triggers changed when underlying set is changed', () => {
    const set = new TreeIndexNodeCollection(new IndexSet([1, 2, 3]));
    const style: NodeAppearance = { visible: false };
    provider.assignStyledNodeCollection(set, style);
    const listener = jest.fn();
    provider.on('changed', listener);

    set.updateSet(new IndexSet([3, 4, 5, 6]));
    jest.runAllTimers();

    expect(listener).toBeCalledTimes(1);
  });

  test('does not trigger changed when removed set is changed', () => {
    const nodeCollection = new TreeIndexNodeCollection(new IndexSet([1, 2, 3]));
    const style: NodeAppearance = { visible: false };
    provider.assignStyledNodeCollection(nodeCollection, style);
    provider.unassignStyledNodeCollection(nodeCollection);
    const listener = jest.fn();
    provider.on('changed', listener);

    nodeCollection.updateSet(new IndexSet([3, 4, 5, 6]));
    jest.runAllTimers();

    expect(listener).not.toBeCalled();
  });

  test('loadingStateChanged is triggered while NodeCollection is loading', () => {
    const isLoadingChangedListener = jest.fn();
    provider.on('loadingStateChanged', isLoadingChangedListener);
    const nodeCollection = new StubNodeCollection();
    provider.assignStyledNodeCollection(nodeCollection, { outlineColor: NodeOutlineColor.Blue });

    nodeCollection.isLoading = true;
    nodeCollection.triggerChanged();
    jest.runAllTimers();
    expect(isLoadingChangedListener).toBeCalledWith(true);
    isLoadingChangedListener.mockReset();

    nodeCollection.isLoading = false;
    nodeCollection.triggerChanged();
    jest.runAllTimers();
    expect(isLoadingChangedListener).toBeCalledWith(false);
  });
});

class StubNodeCollection extends NodeCollectionBase {
  public isLoading = false;

  constructor() {
    super('stub');
  }

  getIndexSet(): IndexSet {
    return new IndexSet();
  }
  triggerChanged() {
    this.notifyChanged();
  }
  serialize(): SerializedNodeCollection {
    return { token: 'stub', state: {}, options: {} };
  }
  clear() {}
}
