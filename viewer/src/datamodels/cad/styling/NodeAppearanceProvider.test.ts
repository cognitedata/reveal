/*!
 * Copyright 2021 Cognite AS
 */

import { NodeAppearance } from '../NodeAppearance';
import { ByTreeIndexNodeSet } from './ByTreeIndexNodeSet';
import { IndexSet } from '../../../utilities/IndexSet';
import { NodeAppearanceProvider } from './NodeAppearanceProvider';
import { NodeSet, SerializedNodeSet } from './NodeSet';
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
    const set1 = new ByTreeIndexNodeSet(new IndexSet([1, 2, 3]));
    const style1: NodeAppearance = { visible: false };
    const set2 = new ByTreeIndexNodeSet(new IndexSet([2, 3, 4]));
    const style2: NodeAppearance = { visible: true };
    provider.addStyledSet(set1, style1);
    provider.addStyledSet(set2, style2);

    provider.applyStyles(applyCb);

    expect(applyCb).toBeCalledTimes(2);
    expect(applyCb.mock.calls[0]).toEqual([expect.anything(), expect.anything(), set1.getIndexSet(), style1]);
    expect(applyCb.mock.calls[1]).toEqual([expect.anything(), expect.anything(), set2.getIndexSet(), style2]);
  });

  test('applyStyles() is not invoced for removed style set', () => {
    const applyCb = jest.fn();
    const set1 = new ByTreeIndexNodeSet(new IndexSet([1, 2, 3]));
    const style1: NodeAppearance = { visible: false };
    const set2 = new ByTreeIndexNodeSet(new IndexSet([2, 3, 4]));
    const style2: NodeAppearance = { visible: true };
    provider.addStyledSet(set1, style1);
    provider.addStyledSet(set2, style2);

    provider.removeStyledSet(set2);
    provider.applyStyles(applyCb);

    expect(applyCb).toBeCalledTimes(1);
    expect(applyCb).toBeCalledWith(expect.anything(), expect.anything(), set1.getIndexSet(), style1);
  });

  test('add/change/remove style triggers changed-listener', () => {
    const listener = jest.fn();
    const set = new ByTreeIndexNodeSet(new IndexSet([1, 2, 3]));
    provider.on('changed', listener);

    provider.addStyledSet(set, {});
    expect(listener).toBeCalledTimes(1);

    provider.changeStyledSetAppearance(set, { visible: false });
    expect(listener).toBeCalledTimes(2);

    provider.removeStyledSet(set);
    expect(listener).toBeCalledTimes(3);
  });

  test('triggers changed when underlying set is changed', () => {
    const set = new ByTreeIndexNodeSet(new IndexSet([1, 2, 3]));
    const style: NodeAppearance = { visible: false };
    provider.addStyledSet(set, style);
    const listener = jest.fn();
    provider.on('changed', listener);

    set.updateSet(new IndexSet([3, 4, 5, 6]));
    jest.runAllTimers();

    expect(listener).toBeCalledTimes(1);
  });

  test('does not trigger changed when removed set is changed', () => {
    const set = new ByTreeIndexNodeSet(new IndexSet([1, 2, 3]));
    const style: NodeAppearance = { visible: false };
    provider.addStyledSet(set, style);
    provider.removeStyledSet(set);
    const listener = jest.fn();
    provider.on('changed', listener);

    set.updateSet(new IndexSet([3, 4, 5, 6]));
    jest.runAllTimers();

    expect(listener).not.toBeCalled();
  });

  test('applyStyles() triggers with incremented revision after changing set', () => {
    const applyCb = jest.fn();
    const set = new ByTreeIndexNodeSet(new IndexSet([1, 2, 3]));
    const style: NodeAppearance = { visible: false };

    provider.addStyledSet(set, style);
    provider.applyStyles(applyCb);
    expect(applyCb).toBeCalledWith(expect.anything(), 0, expect.anything(), expect.anything());
    applyCb.mockClear();

    set.updateSet(new IndexSet([2, 3, 4]));
    jest.runAllTimers();
    provider.applyStyles(applyCb);
    expect(applyCb).toBeCalledWith(expect.anything(), 1, expect.anything(), expect.anything());
  });

  test('loadingStateChanged is triggered while NodeSet is loading', () => {
    const isLoadingChangedListener = jest.fn();
    provider.on('loadingStateChanged', isLoadingChangedListener);
    const nodeSet = new StubNodeSet();
    provider.addStyledSet(nodeSet, { outlineColor: NodeOutlineColor.Blue });

    nodeSet.isLoading = true;
    nodeSet.triggerChanged();
    jest.runAllTimers();
    expect(isLoadingChangedListener).toBeCalledWith(true);
    isLoadingChangedListener.mockReset();

    nodeSet.isLoading = false;
    nodeSet.triggerChanged();
    jest.runAllTimers();
    expect(isLoadingChangedListener).toBeCalledWith(false);
  });
});

class StubNodeSet extends NodeSet {
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
  serialize(): SerializedNodeSet {
    return { token: 'stub', state: {}, options: {} };
  }
  clear() {}
}
