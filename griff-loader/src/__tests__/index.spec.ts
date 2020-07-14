import { mergeInsert, AccessorFunc } from 'index';

import { Datapoint, StringDatapoint } from '../types';

const toPoints = (arr: number[], from: string): StringDatapoint[] =>
  arr.map((d: number) => ({ timestamp: d, value: from }));

const xAccessor: AccessorFunc = (d: Datapoint): number => d.timestamp;

describe('griff-loader', () => {
  test('Merge insert [base[0] <= toInsert[0] <= toInsert[1] <= base[1]]', () => {
    const base = toPoints([1, 5, 10, 15], 'base');
    const toInsert = toPoints([6, 7, 8], 'insert');
    const expectedOutput: StringDatapoint[] = [
      {
        timestamp: 1,
        value: 'base',
      },
      {
        timestamp: 6,
        value: 'insert',
      },
      {
        timestamp: 7,
        value: 'insert',
      },
      {
        timestamp: 8,
        value: 'insert',
      },
      {
        timestamp: 10,
        value: 'base',
      },
      {
        timestamp: 15,
        value: 'base',
      },
    ];
    const merged = mergeInsert(base, toInsert, [5, 8], xAccessor);
    expect(merged).toEqual(expectedOutput);
  });

  test('Merge insert [empty base]', () => {
    const base = toPoints([], 'base');
    const toInsert = toPoints([1, 5], 'insert');
    const expectedOutput: StringDatapoint[] = [
      { timestamp: 1, value: 'insert' },
      { timestamp: 5, value: 'insert' },
    ];
    const merged = mergeInsert(base, toInsert, [0, 5], xAccessor);
    expect(merged).toEqual(expectedOutput);
  });

  test('Merge insert [One insert point]', () => {
    const base = toPoints([1, 5], 'base');
    const toInsert = toPoints([5], 'insert');
    const expectedOutput: Datapoint[] = [
      { timestamp: 1, value: 'base' },
      { timestamp: 5, value: 'insert' },
    ];
    const merged = mergeInsert(base, toInsert, [3, 5], xAccessor);
    expect(expectedOutput).toEqual(merged);
  });

  test('Merge insert [Missing xAccessor]', () => {
    const base = toPoints([1, 5], 'base');
    const toInsert = toPoints([5], 'insert');
    const expectedOutput: Datapoint[] = [
      { timestamp: 1, value: 'base' },
      { timestamp: 5, value: 'insert' },
    ];
    const merged = mergeInsert(base, toInsert, [3, 5], undefined);
    expect(expectedOutput).toEqual(merged);
  });
});
