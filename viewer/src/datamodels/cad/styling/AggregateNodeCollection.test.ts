/*!
 * Copyright 2021 Cognite AS
 */

import { AggregateNodeCollection } from './AggregateNodeCollection';
import { SimpleNodeCollection } from './SimpleNodeCollection';
import { IndexSet } from '../../../utilities/IndexSet';
import { NodeCollectionBase, SerializedNodeCollection } from './NodeCollection';

describe('AggregateNodeCollection', () => {
  test('empty set, returns empty index', () => {
    const set = new AggregateNodeCollection('intersection');
    expect(set.getIndexSet()).toEqual(new IndexSet());
  });

  test('single INTERSECTION set, getIndexSet() returns or SimpleNodeCollection', () => {
    const set = new AggregateNodeCollection('intersection', [new SimpleNodeCollection(new IndexSet([1, 2, 3]))]);
    expect(set.getIndexSet()).toEqual(new IndexSet([1, 2, 3]));
  });

  test('single UNION set, getIndexSet() returns orSimpleNodeCollection', () => {
    const set = new AggregateNodeCollection('union', [new SimpleNodeCollection(new IndexSet([1, 2, 3]))]);
    expect(set.getIndexSet()).toEqual(new IndexSet([1, 2, 3]));
  });

  test('two INTERSECT SimpleNodeCollection returns intersection', () => {
    const setA = new SimpleNodeCollection(new IndexSet([1, 2, 3]));
    const setB = new SimpleNodeCollection(new IndexSet([2, 3, 4]));
    const combinedSet = new AggregateNodeCollection('intersection', [setA, setB]);
    expect(combinedSet.getIndexSet()).toEqual(new IndexSet([2, 3]));
  });

  test('two UNION SimpleNodeCollection returns union', () => {
    const setA = new SimpleNodeCollection(new IndexSet([1, 2, 3]));
    const setB = new SimpleNodeCollection(new IndexSet([2, 3, 4]));
    const combinedSet = new AggregateNodeCollection('union', [setA, setB]);
    expect(combinedSet.getIndexSet()).toEqual(new IndexSet([1, 2, 3, 4]));
  });

  test('isLoading is true when at least one sub-set is loading', () => {
    const setA = new StubNodeCollection();
    const setB = new StubNodeCollection();

    const combinedSet = new AggregateNodeCollection('union', [setA, setB]);
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

class StubNodeCollection extends NodeCollectionBase {
  private _indexSet = new IndexSet();
  private _isLoading = false;

  constructor() {
    super('stub');
  }

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
  clear() {
    this._indexSet = new IndexSet();
  }
  serialize(): SerializedNodeCollection {
    return { token: 'stub', state: {} };
  }
}
