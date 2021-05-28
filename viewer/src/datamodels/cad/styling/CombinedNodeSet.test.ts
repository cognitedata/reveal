/*!
 * Copyright 2021 Cognite AS
 */

import { CombinedNodeSet } from './CombinedNodeSet';
import { ByTreeIndexNodeSet } from './ByTreeIndexNodeSet';
import { IndexSet } from '../../../utilities/IndexSet';
import { NodeSet } from '.';

describe('CombinedNodeSet', () => {
  test('empty set, returns empty index', () => {
    const set = new CombinedNodeSet('intersection');
    expect(set.getIndexSet()).toEqual(new IndexSet());
  });

  test('single INTERSECTION set, getIndexSet() returns original', () => {
    const set = new CombinedNodeSet('intersection', [new ByTreeIndexNodeSet(new IndexSet([1, 2, 3]))]);
    expect(set.getIndexSet()).toEqual(new IndexSet([1, 2, 3]));
  });

  test('single UNION set, getIndexSet() returns original', () => {
    const set = new CombinedNodeSet('union', [new ByTreeIndexNodeSet(new IndexSet([1, 2, 3]))]);
    expect(set.getIndexSet()).toEqual(new IndexSet([1, 2, 3]));
  });

  test('two INTERSECTION sets, getIndexSet() returns intersection', () => {
    const setA = new ByTreeIndexNodeSet(new IndexSet([1, 2, 3]));
    const setB = new ByTreeIndexNodeSet(new IndexSet([2, 3, 4]));
    const combinedSet = new CombinedNodeSet('intersection', [setA, setB]);
    expect(combinedSet.getIndexSet()).toEqual(new IndexSet([2, 3]));
  });

  test('two UNION sets, getIndexSet() returns union', () => {
    const setA = new ByTreeIndexNodeSet(new IndexSet([1, 2, 3]));
    const setB = new ByTreeIndexNodeSet(new IndexSet([2, 3, 4]));
    const combinedSet = new CombinedNodeSet('union', [setA, setB]);
    expect(combinedSet.getIndexSet()).toEqual(new IndexSet([1, 2, 3, 4]));
  });

  test('isLoading is true when at least one sub-set is loading', () => {
    const setA = new StubNodeSet();
    const setB = new StubNodeSet();

    const combinedSet = new CombinedNodeSet('union', [setA, setB]);
    expect(combinedSet.isLoading).toBeFalse();

    setA.isLoading = true;
    expect(combinedSet.isLoading).toBeTrue();

    setB.isLoading = true;
    expect(combinedSet.isLoading).toBeTrue();

    setA.isLoading = false;
    setB.isLoading = false;
    expect(combinedSet.isLoading).toBeFalse();
  });
});

class StubNodeSet extends NodeSet {
  private _indexSet = new IndexSet();
  private _isLoading = false;

  get isLoading(): boolean {
    return this._isLoading;
  }
  set isLoading(v: boolean) {
    this._isLoading = v;
  }
  getIndexSet(): IndexSet {
    return this._indexSet;
  }
  setIndexSet(set: IndexSet) {
    this._indexSet = set;
  }
}
