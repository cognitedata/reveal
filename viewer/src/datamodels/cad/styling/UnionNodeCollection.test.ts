/*!
 * Copyright 2021 Cognite AS
 */

import { SimpleNodeCollection } from './SimpleNodeCollection';
import { IndexSet } from '../../../utilities/IndexSet';

import { StubNodeCollection } from './stubs/StubNodeCollection';
import { UnionNodeCollection } from './UnionNodeCollection';

describe('UnionNodeSetCollection', () => {
  test('empty set, returns empty index', () => {
    const set = new UnionNodeCollection();
    expect(set.getIndexSet()).toEqual(new IndexSet());
  });

  test('single set, getIndexSet() returns original', () => {
    const set = new UnionNodeCollection([new SimpleNodeCollection(new IndexSet([1, 2, 3]))]);
    expect(set.getIndexSet()).toEqual(new IndexSet([1, 2, 3]));
  });

  test('two SimpleNodeCollection returns union', () => {
    const setA = new SimpleNodeCollection(new IndexSet([1, 2, 3]));
    const setB = new SimpleNodeCollection(new IndexSet([2, 3, 4]));
    const combinedSet = new UnionNodeCollection([setA, setB]);
    expect(combinedSet.getIndexSet()).toEqual(new IndexSet([1, 2, 3, 4]));
  });

  test('isLoading is true when at least one sub-set is loading', () => {
    const setA = new StubNodeCollection();
    const setB = new StubNodeCollection();

    const combinedSet = new UnionNodeCollection([setA, setB]);
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
