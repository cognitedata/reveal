/*!
 * Copyright 2021 Cognite AS
 */

import { NodeAppearance } from '..';
import { FixedNodeSet } from './FixedNodeSet';
import { IndexSet } from '../../../utilities/IndexSet';
import { NodeStyleProvider } from './NodeStyleProvider';

describe('NodeStyleProvider', () => {
  let provider: NodeStyleProvider;

  beforeEach(() => {
    provider = new NodeStyleProvider();
  });

  test('applyStyles() when there are no added sets does nothing', () => {
    const applyCb = jest.fn();

    provider.applyStyles(applyCb);

    expect(applyCb).not.toBeCalled();
  });

  test('applyStyles() applies styles in the order they were added', () => {
    const applyCb = jest.fn();
    const set1 = new FixedNodeSet(new IndexSet([1, 2, 3]));
    const style1: NodeAppearance = { visible: false };
    const set2 = new FixedNodeSet(new IndexSet([2, 3, 4]));
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
    const set1 = new FixedNodeSet(new IndexSet([1, 2, 3]));
    const style1: NodeAppearance = { visible: false };
    const set2 = new FixedNodeSet(new IndexSet([2, 3, 4]));
    const style2: NodeAppearance = { visible: true };
    provider.addStyledSet(set1, style1);
    provider.addStyledSet(set2, style2);

    provider.removeStyledSet(set2);
    provider.applyStyles(applyCb);

    expect(applyCb).toBeCalledTimes(1);
    expect(applyCb).toBeCalledWith(expect.anything(), expect.anything(), set1.getIndexSet(), style1);
  });

  test('add and remove style triggers changed', () => {
    const listener = jest.fn();
    const set = new FixedNodeSet(new IndexSet([1, 2, 3]));
    provider.on('changed', listener);

    provider.addStyledSet(set, {});
    expect(listener).toBeCalledTimes(1);

    provider.removeStyledSet(set);
    expect(listener).toBeCalledTimes(2);
  });

  test('triggers changed when underlying set is changed', () => {
    const set = new FixedNodeSet(new IndexSet([1, 2, 3]));
    const style: NodeAppearance = { visible: false };
    provider.addStyledSet(set, style);
    const listener = jest.fn();
    provider.on('changed', listener);

    set.updateSet(new IndexSet([3, 4, 5, 6]));

    expect(listener).toBeCalledTimes(1);
  });

  test('does not trigger changed when removed set is changed', () => {
    const set = new FixedNodeSet(new IndexSet([1, 2, 3]));
    const style: NodeAppearance = { visible: false };
    provider.addStyledSet(set, style);
    provider.removeStyledSet(set);
    const listener = jest.fn();
    provider.on('changed', listener);

    set.updateSet(new IndexSet([3, 4, 5, 6]));

    expect(listener).not.toBeCalled();
  });

  test('applyStyles() triggers with incremented revision after changing set', () => {
    const applyCb = jest.fn();
    const set = new FixedNodeSet(new IndexSet([1, 2, 3]));
    const style: NodeAppearance = { visible: false };

    provider.addStyledSet(set, style);
    provider.applyStyles(applyCb);
    expect(applyCb).toBeCalledWith(expect.anything(), 0, expect.anything(), expect.anything());
    applyCb.mockClear();

    set.updateSet(new IndexSet([2, 3, 4]));
    provider.applyStyles(applyCb);
    expect(applyCb).toBeCalledWith(expect.anything(), 1, expect.anything(), expect.anything());
  });
});
