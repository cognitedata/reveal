/*!
 * Copyright 2021 Cognite AS
 */

import { IndexSet } from '@reveal/utilities';

import { TreeIndexNodeCollection } from './TreeIndexNodeCollection';

import { StubNodeCollection } from './stubs/StubNodeCollection';
import { UnionNodeCollection } from './UnionNodeCollection';

import * as SeededRandom from 'random-seed';

import { createRandomBoxes } from '../../../test-utilities/src/createBoxes';

describe('UnionNodeSetCollection', () => {
  test('empty set, returns empty index', () => {
    const set = new UnionNodeCollection();
    expect(set.getIndexSet()).toEqual(new IndexSet());
  });

  test('single set, getIndexSet() returns original', () => {
    const set = new UnionNodeCollection([new TreeIndexNodeCollection(new IndexSet([1, 2, 3]))]);
    expect(set.getIndexSet()).toEqual(new IndexSet([1, 2, 3]));
  });

  test('two TreeIndexNodeCollection returns union', () => {
    const setA = new TreeIndexNodeCollection(new IndexSet([1, 2, 3]));
    const setB = new TreeIndexNodeCollection(new IndexSet([2, 3, 4]));
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

  test('union area collection contains all areas in the operand collections', () => {
    const random = SeededRandom.create('someseed');

    const n = 500;
    const d = 10;
    const ms = 200;

    const boxes0 = createRandomBoxes(n, d, ms, random);
    const boxes1 = createRandomBoxes(n, d, ms, random);

    const collection0 = new TreeIndexNodeCollection();
    const collection1 = new TreeIndexNodeCollection();

    collection0.addAreas(boxes0);
    collection1.addAreas(boxes1);

    const union = new UnionNodeCollection([collection0, collection1]);

    const unionBoxes = union.getAreas();

    const allBoxes = [...boxes0, ...boxes1];

    for (const box of allBoxes) {
      let isInUnion = false;
      for (const unionBox of unionBoxes.areas()) {
        if (unionBox.containsBox(box)) {
          isInUnion = true;
          break;
        }
      }

      expect(isInUnion).toEqual(true);
    }
  });
});
