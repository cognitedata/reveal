/*!
 * Copyright 2021 Cognite AS
 */

import { IndexSet } from './IndexSet';
import { NumericRange } from './NumericRange';

describe('IndexSet', () => {
  test('addRange first time adds a single range', () => {
    const set = new IndexSet();
    set.addRange(NumericRange.createFromInterval(1, 11));
    expect(Array.from(set.ranges())).toEqual([NumericRange.createFromInterval(1, 11)]);
  });

  test('add two non-overlapping ranges', () => {
    const ranges = [NumericRange.createFromInterval(1, 3), NumericRange.createFromInterval(5, 7)];
    const set = new IndexSet();
    for (const range of ranges) {
      set.addRange(range);
    }
    expect(Array.from(set.ranges())).toEqual(ranges);
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
    const set = new IndexSet();
    set.addRange(NumericRange.createFromInterval(4, 8));

    set.addRange(NumericRange.createFromInterval(5, 7));

    expect(set.raw()).toEqual([4, 8]);
    expect(Array.from(set.ranges())).toEqual([NumericRange.createFromInterval(4, 8)]);
  });

  test('add [5..8] to [4..8] -> [4..8]', () => {
    const set = new IndexSet();
    set.addRange(NumericRange.createFromInterval(4, 8));

    set.addRange(NumericRange.createFromInterval(5, 8));

    expect(Array.from(set.ranges())).toEqual([NumericRange.createFromInterval(4, 8)]);
  });

  test('add [4..7] to [4..8] -> [4..8]', () => {
    const set = new IndexSet();
    set.addRange(NumericRange.createFromInterval(4, 8));

    set.addRange(NumericRange.createFromInterval(4, 7));

    expect(set.raw()).toEqual([4, 8]);
    expect(Array.from(set.ranges())).toEqual([NumericRange.createFromInterval(4, 8)]);
  });

  test('add [1..4] to [2..4] -> [1..4]', () => {
    const set = new IndexSet();
    set.addRange(NumericRange.createFromInterval(2, 4));

    set.addRange(NumericRange.createFromInterval(1, 4));

    expect(Array.from(set.ranges())).toEqual([NumericRange.createFromInterval(1, 4)]);
  });

  test('add [2..5] to [2..4] -> [1..5]', () => {
    const set = new IndexSet();
    set.addRange(NumericRange.createFromInterval(2, 4));

    set.addRange(NumericRange.createFromInterval(2, 5));

    expect(Array.from(set.ranges())).toEqual([NumericRange.createFromInterval(2, 5)]);
  });

  test('add [2..4] to [1..3] -> [1..4]', () => {
    const set = new IndexSet();
    set.addRange(NumericRange.createFromInterval(1, 3));

    set.addRange(NumericRange.createFromInterval(2, 4));

    expect(Array.from(set.ranges())).toEqual([NumericRange.createFromInterval(1, 4)]);
  });

  test('add [1..4] to [2..3] -> [1..4]', () => {
    const set = new IndexSet();
    set.addRange(NumericRange.createFromInterval(2, 3));

    set.addRange(NumericRange.createFromInterval(1, 4));

    expect(Array.from(set.ranges())).toEqual([NumericRange.createFromInterval(1, 4)]);
  });

  test('add [1..3] to [3..6] -> [1..6]', () => {
    const set = new IndexSet();
    set.addRange(NumericRange.createFromInterval(3, 6));

    set.addRange(NumericRange.createFromInterval(1, 3));

    expect(Array.from(set.ranges())).toEqual([NumericRange.createFromInterval(1, 6)]);
  });

  test('add [3..6] to [1..3] -> [1..6]', () => {
    const set = new IndexSet();
    set.addRange(NumericRange.createFromInterval(1, 3));

    set.addRange(NumericRange.createFromInterval(3, 6));

    expect(Array.from(set.ranges())).toEqual([NumericRange.createFromInterval(1, 6)]);
  });

  test('add [1..10] to ([2..4],[7..8]) -> [1..10]', () => {
    const set = new IndexSet();
    set.addRange(NumericRange.createFromInterval(2, 4));
    set.addRange(NumericRange.createFromInterval(7, 8));

    set.addRange(NumericRange.createFromInterval(1, 10));

    expect(Array.from(set.ranges())).toEqual([NumericRange.createFromInterval(1, 10)]);
  });

  test('add [1..3] to [2,2] -> [1..3]', () => {
    const set = new IndexSet();
    set.addRange(NumericRange.createFromInterval(2, 4));
    set.addRange(NumericRange.createFromInterval(7, 8));

    set.addRange(NumericRange.createFromInterval(1, 10));

    expect(Array.from(set.ranges())).toEqual([NumericRange.createFromInterval(1, 10)]);
  });

  test('add [1..10] to ([2..3],[4..5],[7..8]) -> [1..10]', () => {
    const set = new IndexSet();
    set.addRange(NumericRange.createFromInterval(2, 3));
    set.addRange(NumericRange.createFromInterval(2, 3));
    set.addRange(NumericRange.createFromInterval(7, 8));

    set.addRange(NumericRange.createFromInterval(1, 10));

    expect(Array.from(set.ranges())).toEqual([NumericRange.createFromInterval(1, 10)]);
  });

  test('add [2..9] to ([2..4],[7..8]) -> [2..8]', () => {
    const set = new IndexSet();
    set.addRange(NumericRange.createFromInterval(2, 4));
    set.addRange(NumericRange.createFromInterval(7, 8));

    set.addRange(NumericRange.createFromInterval(1, 10));

    expect(Array.from(set.ranges())).toEqual([NumericRange.createFromInterval(1, 10)]);
  });

  test('add random ranges, matches plain Set<number>', () => {
    const indexSet = new IndexSet();
    const plainSet = new Set<number>();
    for (let i = 0; i < 1000; i++) {
      const start = Math.floor(Math.random() * 10000);
      const count = Math.floor(Math.random() * 1000);

      console.log(`Add [${start}, ${start + count}]`);
      indexSet.addRange(new NumericRange(start, count));
      for (let j = 0; j < count; ++j) plainSet.add(start + j);
      expect(indexSet.toPlainSet()).toEqual(plainSet);
    }
  });

  test('add known failing', () => {
    const indexSet = new IndexSet();
    const plainSet = new Set<number>();
    for (const r of [
      [8135, 8550],
      [6356, 7023],
      [2394, 2997],
      [9467, 9655],
      [7489, 8086],
      [4740, 5246],
      [4563, 5253],
      [7195, 7343],
      [6844, 7131],
      [5390, 5911]
    ]) {
      const range = NumericRange.createFromInterval(r[0], r[1]);
      indexSet.addRange(range);
      for (let i = r[0]; i <= r[1]; ++i) plainSet.add(i);
    }

    const range = NumericRange.createFromInterval(7443, 7533);
    indexSet.addRange(range);
    for (let i = range.from; i <= range.toInclusive; ++i) plainSet.add(i);

    expect(indexSet.toPlainSet()).toEqual(plainSet);
  });

  // test('contains all elements after adding range', () => {
  //   const set = new IndexSet();
  //   set.addRange(new NumericRange(11, 5));
  //   expect(set.count).toEqual(5);
  //   for (let i = 0; i < 11; i++) {
  //     expect(set.contains(i)).toBeFalse();
  //   }
  //   for (let i = 11; i < 16; ++i) {
  //     expect(set.contains(i)).toBeTrue();
  //   }
  //   expect(set.contains(16)).toBeFalse();
  // });
  // test('contains correct elements after adding then removing elements', () => {
  //   const set = new IndexSet();
  //   set.addRange(new NumericRange(1, 3));
  //   set.remove(2);
  //   expect(set.count).toEqual(2);
  //   expect(set.contains(1)).toBeTrue();
  //   expect(set.contains(2)).toBeFalse();
  //   expect(set.contains(3)).toBeTrue();
  // });
  // test('two overlapping set then removing some elements', () => {
  //   const set = new IndexSet();
  //   set.addRange(new NumericRange(3, 10));
  //   set.addRange(new NumericRange(2, 12));
  //   set.removeRange(new NumericRange(5, 2));
  //   expect(set.count).toEqual(10);
  //   expect(Array.from(set.values()).sort((a, b) => a - b)).toEqual([2, 3, 4, 7, 8, 9, 10, 11, 12, 13]);
  // });
  // test('random adds and removes, result set is correct', () => {
  //   const expected = new Set<number>();
  //   const set = new IndexSet();
  //   for (let i = 0; i < 10000; i++) {
  //     const v = Math.round(1000 * (Math.random() - 0.5));
  //     const value = Math.abs(v);
  //     if (v > 0) {
  //       set.add(value);
  //       expected.add(value);
  //     } else {
  //       set.remove(value);
  //       expected.delete(value);
  //     }
  //   }
  //   expect(set.toArray().sort()).toEqual(Array.from(expected).sort());
  // });
  // test('intersectsWith without overlap, result is empty', () => {
  //   const set = new IndexSet();
  //   set.addRange(new NumericRange(0, 10));
  //   set.intersectWith(new IndexSet());
  //   expect(Array.from(set.values())).toBeEmpty();
  // });
  // test('intersectsWith with partial overlap, result is overlap items', () => {
  //   const set = new IndexSet();
  //   set.add(1);
  //   set.add(3);
  //   set.add(5);
  //   set.add(7);
  //   const set2 = new IndexSet();
  //   set2.addRange(new NumericRange(5, 3));
  //   set.intersectWith(set2);
  //   expect(Array.from(set.values()).sort()).toEqual([5, 7]);
  // });
  // test('union with self, returns original', () => {
  //   const set = new IndexSet();
  //   set.addRange(new NumericRange(5, 3));
  //   set.unionWith(set);
  //   expect(Array.from(set.values()).sort()).toEqual([5, 6, 7]);
  // });
  // test('union partially overlapping', () => {
  //   const set = new IndexSet();
  //   set.addRange(new NumericRange(1, 3));
  //   const set2 = new IndexSet();
  //   set2.addRange(new NumericRange(2, 3));
  //   set.unionWith(set2);
  //   expect(Array.from(set.values()).sort()).toEqual([1, 2, 3, 4]);
  // });
  // test('clone() returns equal set', () => {
  //   const set = new IndexSet();
  //   set.addRange(new NumericRange(1, 5));
  //   const cloned = set.clone();
  //   expect(cloned).toEqual(set);
  // });
  // test('manipulate cloned set doesnt modify original', () => {
  //   const set = new IndexSet();
  //   set.addRange(new NumericRange(1, 5));
  //   const cloned = set.clone();
  //   cloned.add(11);
  //   expect(set.contains(11)).toBeFalse();
  // });
  // test('manipulate original set doesnt modify clone', () => {
  //   const set = new IndexSet();
  //   set.addRange(new NumericRange(1, 5));
  //   const cloned = set.clone();
  //   set.add(11);
  //   expect(cloned.contains(11)).toBeFalse();
  // });
  // test('hasIntersectionWith returns true if there is any overlap', () => {
  //   const set1 = new IndexSet();
  //   set1.addRange(new NumericRange(1, 5));
  //   const set2 = new IndexSet();
  //   set2.addRange(new NumericRange(3, 4));
  //   expect(set1.hasIntersectionWith(set2)).toBeTrue();
  // });
  // test('hasIntersectionWith returns false if there is no overlap', () => {
  //   const set1 = new IndexSet();
  //   set1.addRange(new NumericRange(1, 5));
  //   const set2 = new IndexSet();
  //   set2.addRange(new NumericRange(10, 4));
  //   expect(set1.hasIntersectionWith(set2)).toBeFalse();
  // });
  // test('differenceWith removes overlapping elements', () => {
  //   const set1 = new IndexSet();
  //   set1.addRange(new NumericRange(1, 5));
  //   const set2 = new IndexSet();
  //   set2.addRange(new NumericRange(3, 5));
  //   set1.differenceWith(set2);
  //   expect(Array.from(set1.values()).sort()).toEqual([1, 2]);
  // });
});
