/*!
 * Copyright 2021 Cognite AS
 */

import { CombinedNodeSet } from './CombinedNodeSet';
import { FixedNodeSet } from './FixedNodeSet';
import { IndexSet } from './IndexSet';

describe('CombinedNodeSet', () => {
  test('empty set, returns empty index', () => {
    const set = new CombinedNodeSet([], 'intersection');
    expect(set.getIndexSet()).toEqual(new IndexSet());
  });

  test('single INTERSECTION set, getIndexSet() returns original', () => {
    const set = new CombinedNodeSet([new FixedNodeSet(new IndexSet([1, 2, 3]))], 'intersection');
    expect(set.getIndexSet()).toEqual(new IndexSet([1, 2, 3]));
  });

  test('single UNION set, getIndexSet() returns original', () => {
    const set = new CombinedNodeSet([new FixedNodeSet(new IndexSet([1, 2, 3]))], 'union');
    expect(set.getIndexSet()).toEqual(new IndexSet([1, 2, 3]));
  });

  test('two INTERSECTION sets, getIndexSet() returns intersection', () => {
    const setA = new FixedNodeSet(new IndexSet([1, 2, 3]));
    const setB = new FixedNodeSet(new IndexSet([2, 3, 4]));
    const combinedSet = new CombinedNodeSet([setA, setB], 'intersection');
    expect(combinedSet.getIndexSet()).toEqual(new IndexSet([2, 3]));
  });

  test('two UNION sets, getIndexSet() returns union', () => {
    const setA = new FixedNodeSet(new IndexSet([1, 2, 3]));
    const setB = new FixedNodeSet(new IndexSet([2, 3, 4]));
    const combinedSet = new CombinedNodeSet([setA, setB], 'union');
    expect(combinedSet.getIndexSet()).toEqual(new IndexSet([1, 2, 3, 4]));
  });
});
