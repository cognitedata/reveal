/*!
 * Copyright 2021 Cognite AS
 */

import { IndexSet } from '@reveal/utilities';

import { NodeAppearance, NodeOutlineColor } from './NodeAppearance';
import { NodeAppearanceProvider } from './NodeAppearanceProvider';
import { StubNodeCollection } from './stubs/StubNodeCollection';
import { TreeIndexNodeCollection } from './TreeIndexNodeCollection';

import { createRandomBoxes } from '../../../test-utilities/src/createBoxes';
import * as SeededRandom from 'random-seed';

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
    jest.runAllTimers();
    expect(listener).toBeCalledTimes(1);

    provider.assignStyledNodeCollection(nodeCollection, { visible: false });
    jest.runAllTimers();
    expect(listener).toBeCalledTimes(2);

    provider.unassignStyledNodeCollection(nodeCollection);
    jest.runAllTimers();
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
    jest.runAllTimers();
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

  test('getPrioritizedAreas returns areas that contain all boxes for all collections', () => {
    const rand = SeededRandom.create('someseed');
    const boxes0 = createRandomBoxes(100, 10, 30, rand);
    const boxes1 = createRandomBoxes(100, 10, 30, rand);

    const nodeCollection0 = new TreeIndexNodeCollection(new IndexSet([1, 3, 5]));
    const nodeCollection1 = new TreeIndexNodeCollection(new IndexSet([6, 9, 12]));

    nodeCollection0.addAreas(boxes0);
    nodeCollection1.addAreas(boxes1);

    provider.assignStyledNodeCollection(nodeCollection0, { prioritizedForLoadingHint: 5 });
    provider.assignStyledNodeCollection(nodeCollection1, { prioritizedForLoadingHint: 4 });

    const areas = provider.getPrioritizedAreas();

    const containedInSomeArea0 = new Array<boolean>(boxes0.length).fill(false);
    const containedInSomeArea1 = new Array<boolean>(boxes1.length).fill(false);

    for (const area of areas) {
      for (let i = 0; i < boxes0.length; i++) {
        if (area.area.containsBox(boxes0[i])) {
          containedInSomeArea0[i] = true;
        }
      }

      for (let i = 0; i < boxes1.length; i++) {
        if (area.area.containsBox(boxes1[i])) {
          containedInSomeArea1[i] = true;
        }
      }
    }

    for (const isContained of containedInSomeArea0) {
      expect(isContained).toBeTrue();
    }

    for (const isContained of containedInSomeArea1) {
      expect(isContained).toBeTrue();
    }
  });

  test('assigning priority triggers callback', () => {
    const nodeCollection0 = new TreeIndexNodeCollection(new IndexSet([1, 3, 5]));
    const nodeCollection1 = new TreeIndexNodeCollection(new IndexSet([6, 8, 10]));
    const nodeCollection2 = new TreeIndexNodeCollection(new IndexSet([4, 3, 2]));

    let numCalls = 0;
    provider.on('prioritizedAreasChanged', () => {
      numCalls++;
    });

    provider.assignStyledNodeCollection(nodeCollection0, { prioritizedForLoadingHint: 5 });
    provider.assignStyledNodeCollection(nodeCollection1, { visible: true });
    provider.assignStyledNodeCollection(nodeCollection2, { prioritizedForLoadingHint: 5 });

    expect(numCalls).toBe(2);
  });
});
