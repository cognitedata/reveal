/*!
 * Copyright 2021 Cognite AS
 */

import { IndexSet } from './IndexSet';
import { NumericRange } from './NumericRange';

describe('IndexSet', () => {
  function runAddTest(params: { ranges: [number, number][]; add: [number, number]; expected: [number, number][] }) {
    const { ranges, add, expected } = params;
    const set = new IndexSet();
    ranges.forEach(r => set.addRange(NumericRange.createFromInterval(r[0], r[1])));

    const toAdd = NumericRange.createFromInterval(add[0], add[1]);
    set.addRange(toAdd);

    const received = Array.from(set.ranges()).map(x => [x.from, x.toInclusive]);
    expect(received.map(x => `[${x[0]}..${x[1]}]`)).toEqual(expected.map(x => `[${x[0]}..${x[1]}]`));
  }

  function runRemoveTest(params: {
    ranges: [number, number][];
    remove: [number, number];
    expected: [number, number][];
  }) {
    const { ranges, remove, expected } = params;
    const set = new IndexSet();
    ranges.forEach(r => set.addRange(NumericRange.createFromInterval(r[0], r[1])));

    const toRemove = NumericRange.createFromInterval(remove[0], remove[1]);
    set.removeRange(toRemove);

    const received = Array.from(set.ranges()).map(x => [x.from, x.toInclusive]);
    expect(received).toEqual(expected);
  }

  test('addRange first time adds a single range', () => {
    const set = new IndexSet();
    set.addRange(NumericRange.createFromInterval(1, 11));
    expect(Array.from(set.ranges())).toEqual([NumericRange.createFromInterval(1, 11)]);
  });

  test('add two non-overlapping ranges', () => {
    const set = new IndexSet();
    set.addRange(NumericRange.createFromInterval(1, 3));
    set.addRange(NumericRange.createFromInterval(5, 7));
    expect(Array.from(set.ranges())).toEqual([
      NumericRange.createFromInterval(1, 3),
      NumericRange.createFromInterval(5, 7)
    ]);
  });

  test('insert non-overlapping range before already added range', () => {
    const set = new IndexSet();
    set.addRange(NumericRange.createFromInterval(5, 7));
    set.addRange(NumericRange.createFromInterval(1, 3));

    expect(Array.from(set.ranges())).toEqual([
      NumericRange.createFromInterval(1, 3),
      NumericRange.createFromInterval(5, 7)
    ]);
  });

  test('add single range interval which overlaps single element ', () => {
    const set = new IndexSet();
    set.addRange(NumericRange.createFromInterval(1, 3));

    set.addRange(NumericRange.createFromInterval(3, 3));

    expect(Array.from(set.ranges())).toEqual([NumericRange.createFromInterval(1, 3)]);
  });

  test('add single range interval which overlaps the end', () => {
    const set = new IndexSet();
    set.addRange(NumericRange.createFromInterval(1, 3));

    set.addRange(NumericRange.createFromInterval(3, 3));

    expect(Array.from(set.ranges())).toEqual([NumericRange.createFromInterval(1, 3)]);
  });

  test('add same range twice', () => {
    const set = new IndexSet();
    set.addRange(NumericRange.createFromInterval(4, 8));
    set.addRange(NumericRange.createFromInterval(4, 8));

    expect(Array.from(set.ranges())).toEqual([NumericRange.createFromInterval(4, 8)]);
  });

  test('add [5..7] to [4..8] -> [4..8]', () => {
    runAddTest({ ranges: [[4, 8]], add: [5, 7], expected: [[4, 8]] });
  });

  test('add [5..8] to [4..8] -> [4..8]', () => {
    runAddTest({ ranges: [[4, 8]], add: [5, 8], expected: [[4, 8]] });
  });

  test('add [4..7] to [4..8] -> [4..8]', () => {
    runAddTest({ ranges: [[4, 8]], add: [4, 7], expected: [[4, 8]] });
  });

  test('add [1..4] to [2..4] -> [1..4]', () => {
    runAddTest({ ranges: [[2, 4]], add: [1, 4], expected: [[1, 4]] });
  });

  test('add [2..5] to [2..4] -> [2..5]', () => {
    runAddTest({ ranges: [[2, 4]], add: [2, 5], expected: [[2, 5]] });
  });

  test('add [5..10] to [4..7] -> [4..10]', () => {
    runAddTest({ ranges: [[4, 7]], add: [5, 10], expected: [[4, 10]] });
  });

  test('add [4..10] to [4..7] -> [4..10]', () => {
    runAddTest({ ranges: [[4, 7]], add: [4, 10], expected: [[4, 10]] });
  });

  test('add [3..6] to [4..7] -> [3..7]', () => {
    runAddTest({ ranges: [[4, 7]], add: [3, 6], expected: [[3, 7]] });
  });

  test('add [3..11] to [4..7] -> [3..11]', () => {
    runAddTest({ ranges: [[4, 7]], add: [3, 11], expected: [[3, 11]] });
  });

  test('add [5..10] to ([4..7],[9..11]) -> [4..11]', () => {
    runAddTest({
      ranges: [
        [4, 7],
        [9, 11]
      ],
      add: [5, 10],
      expected: [[4, 11]]
    });
  });

  test('add [5..12] to ([4..7],[9..11]) -> [4..12]', () => {
    runAddTest({
      ranges: [
        [4, 7],
        [9, 11]
      ],
      add: [5, 12],
      expected: [[4, 12]]
    });
  });

  test('add [2..4] to [1..3] -> [1..4]', () => {
    runAddTest({
      ranges: [[1, 3]],
      add: [2, 4],
      expected: [[1, 4]]
    });
  });

  test('add [1..4] to [2..3] -> [1..4]', () => {
    runAddTest({
      ranges: [[2, 3]],
      add: [1, 4],
      expected: [[1, 4]]
    });
  });

  test('add [1..3] to [3..6] -> [1..6]', () => {
    runAddTest({
      ranges: [[3, 6]],
      add: [1, 3],
      expected: [[1, 6]]
    });
  });

  test('add [1..10] to ([2..4],[7..8]) -> [1..10]', () => {
    runAddTest({
      ranges: [
        [2, 4],
        [7, 8]
      ],
      add: [1, 10],
      expected: [[1, 10]]
    });
  });

  test('add [1..3] to [2..2] -> [1..3]', () => {
    runAddTest({
      ranges: [[2, 2]],
      add: [1, 3],
      expected: [[1, 3]]
    });
  });

  test('add [1..10] to ([2..3],[4..5],[7..8]) -> [1..10]', () => {
    runAddTest({
      ranges: [
        [2, 3],
        [4, 5],
        [7, 8]
      ],
      add: [1, 10],
      expected: [[1, 10]]
    });
  });

  test('add [2..9] to ([2..4],[7..8]) -> [2..9]', () => {
    runAddTest({
      ranges: [
        [2, 4],
        [7, 8]
      ],
      add: [2, 9],
      expected: [[2, 9]]
    });
  });

  test('add [1..8] to ([2..4],[7..8]) -> [1..8]', () => {
    runAddTest({
      ranges: [
        [2, 4],
        [7, 8]
      ],
      add: [1, 8],
      expected: [[1, 8]]
    });
  });

  test('add known failing', () => {
    const indexSet = new IndexSet();
    const plainSet = new Set<number>();

    for (const r of [
      [6108, 6259],
      [5118, 5440],
      [2050, 2186],
      [6363, 7136]
    ]) {
      const range = NumericRange.createFromInterval(r[0], r[1]);
      indexSet.addRange(range);
      for (let i = r[0]; i <= r[1]; ++i) plainSet.add(i);
    }
    const range = NumericRange.createFromInterval(7419, 7753);
    indexSet.addRange(range);
    for (let i = range.from; i <= range.toInclusive; ++i) plainSet.add(i);

    expect(indexSet.toPlainSet()).toEqual(plainSet);
  });

  test('remove [3..4] from [1..10] -> ([1..2],[5..6])', () => {
    runRemoveTest({
      ranges: [[1, 10]],
      remove: [3, 5],
      expected: [
        [1, 2],
        [6, 10]
      ]
    });
  });

  test('remove [3..10] from ([1..4],[6..7],[9..12]) -> ([1..2],[11..12])', () => {
    runRemoveTest({
      ranges: [
        [1, 4],
        [5, 7],
        [9, 12]
      ],
      remove: [3, 10],
      expected: [
        [1, 2],
        [11, 12]
      ]
    });
  });

  test('remove [2..8] from ([1..1],[3..4],[6..8],[10..20]) -> ([1..1],[10..20])', () => {
    runRemoveTest({
      ranges: [
        [1, 1],
        [3, 4],
        [6, 8],
        [10, 20]
      ],
      remove: [2, 8],
      expected: [
        [1, 1],
        [10, 20]
      ]
    });
  });

  test('remove [0..8] from ([1..1],[3..4],[6..8],[10..20]) -> ([1..1],[10..20])', () => {
    runRemoveTest({
      ranges: [
        [1, 1],
        [3, 4],
        [6, 8],
        [10, 20]
      ],
      remove: [0, 8],
      expected: [[10, 20]]
    });
  });

  test('remove [1..8] from ([1..1],[3..4],[6..8],[10..20]) -> ([10..20])', () => {
    runRemoveTest({
      ranges: [
        [1, 1],
        [3, 4],
        [6, 8],
        [10, 20]
      ],
      remove: [1, 8],
      expected: [[10, 20]]
    });
  });

  test('remove [2..9] from ([1..1],[3..4],[6..8],[10..20]) -> ([1..1],[10..20])', () => {
    runRemoveTest({
      ranges: [
        [1, 1],
        [3, 4],
        [6, 8],
        [10, 20]
      ],
      remove: [2, 9],
      expected: [
        [1, 1],
        [10, 20]
      ]
    });
  });

  test('remove [0..100] from ([1..1],[3..4],[6..8],[10..20]) -> ()', () => {
    runRemoveTest({
      ranges: [
        [1, 1],
        [3, 4],
        [6, 8],
        [10, 20]
      ],
      remove: [0, 100],
      expected: []
    });
  });
});
