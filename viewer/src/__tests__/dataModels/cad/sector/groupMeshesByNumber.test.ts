/*!
 * Copyright 2021 Cognite AS
 */

import { groupMeshesByNumber } from '../../../../datamodels/cad/sector/groupMeshesByNumber';

describe('groupMeshesByNumber', () => {
  test('empty input yields no result', () => {
    const result = groupMeshesByNumber(new Float64Array(0));
    expect(result).toBeEmpty();
  });

  test('single item returns one group', () => {
    const result = groupMeshesByNumber(new Float64Array([10]));
    expect(Array.from(result)).toEqual([{ id: 10, meshIndices: [0] }]);
  });

  test('single item with multiple elements, returns sorted indices', () => {
    const result = groupMeshesByNumber(new Float64Array([10, 10, 10, 10]));
    expect(Array.from(result)).toEqual([{ id: 10, meshIndices: [0, 1, 2, 3] }]);
  });

  test('two items sorted and grouped up front, returns correct groups', () => {
    const result = groupMeshesByNumber(new Float64Array([1, 1, 1, 2, 2, 2]));
    expect(Array.from(result)).toEqual([
      { id: 1, meshIndices: [0, 1, 2] },
      { id: 2, meshIndices: [3, 4, 5] }
    ]);
  });

  test('two items with shuffled elements, returns correct groups', () => {
    const result = groupMeshesByNumber(new Float64Array([2, 1, 2, 2, 1, 1]));
    expect(Array.from(result)).toEqual([
      { id: 1, meshIndices: [1, 4, 5] },
      { id: 2, meshIndices: [0, 2, 3] }
    ]);
  });

  test('two groups, first group small, returns correct groups', () => {
    const result = groupMeshesByNumber(new Float64Array([1, 2, 2, 2, 2, 2, 2, 2, 2, 2]));
    expect(Array.from(result)).toEqual([
      { id: 1, meshIndices: [0] },
      { id: 2, meshIndices: [1, 2, 3, 4, 5, 6, 7, 8, 9] }
    ]);
  });
});
