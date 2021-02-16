/*!
 * Copyright 2021 Cognite AS
 */

import { binarySearchLastIndexOf, shiftValuesRight } from './arrays';
import { NumericRange } from './NumericRange';

export class IndexSet {
  // private readonly _intervals = new IntervalTree<number>();
  // Sorted pairs of [from,to]-elements of the contained ranges
  private _intervals: number[] = [];
  // Number of elements used in the _intervals-array (note! will always be a multiple of 2)
  private _intervalsCount = 0;

  constructor(values?: Iterable<number>) {
    if (values !== undefined) {
      for (const v of values) {
        this.add(v);
      }
    }
  }

  clone(): IndexSet {
    const set = new IndexSet();
    set._intervals = [...this._intervals];
    return set;
  }

  add(index: number) {
    // const result = this._intervals.search([index, 1]);
    // if (result.length > 0) {
    //   return;
    // }
    // this._intervals.insert([index, index]);
  }

  addRange(range: NumericRange) {
    // Some 'rules' to keep in mind:
    // - intervals array contains pairs, [startIdx,endIndex]
    // - elements at even positions are startIndexes
    // - elements at odd positions are endIndexes
    // - elements are sorted, and the array is strictly non-decreasing

    function getInsertIdx(idx: number): number {
      return -idx - 1;
    }
    function isExistingIdx(idx: number): boolean {
      return idx >= 0;
    }
    function isStartIdx(idx: number): boolean {
      return idx % 2 == 0;
    }
    function isEndIdx(idx: number): boolean {
      return idx % 2 == 1;
    }

    const idx1 = binarySearchLastIndexOf(this._intervals, range.from);
    const idx2 = binarySearchLastIndexOf(this._intervals, range.toInclusive);

    if (!isExistingIdx(idx1) && idx1 === idx2) {
      // Single range-interval not found in existing interval endpoints
      const insertIdx = getInsertIdx(idx1);
      if (isStartIdx(insertIdx)) {
        // New range, no modification of existing ranges
        this.makeRoomAt(insertIdx);

        this._intervals[insertIdx] = range.from;
        this._intervals[insertIdx + 1] = range.toInclusive;

        this._intervalsCount += 2;
      }
      // else: nothing to do, range is fully inside another range
    } else if (!isExistingIdx(idx1) && !isExistingIdx(idx2)) {
      // From and to is not in list of existing interval endpoints
      const insertIdx1 = getInsertIdx(idx1);
      const insertIdx2 = getInsertIdx(idx2);
      if (isStartIdx(idx1) && insertIdx2 == insertIdx1 + 2) {
        // Range encapsulates an existing range, extend
        // insert [1..4] into [2..3] -> [1..4]
        this._intervals[insertIdx1] = range.from;
        this._intervals[insertIdx2 - 1] = range.toInclusive;
      } else if (isEndIdx(insertIdx1) && insertIdx2 === insertIdx1 + 1) {
        // Range extends an existing range
        // insert [2..4] into [1..3] -> [1..4]
        this._intervals[insertIdx1] = range.toInclusive;
      } else {
        // Range encapsulates more than one existing interval
        // insert [1..10] into ([2,3],[4,5],[7,8]) -> [1..10]
        this._intervals[insertIdx1] = range.from;
        this._intervals[insertIdx2 - 1] = range.toInclusive;
        this.mergeIntervals(insertIdx1 + 1, insertIdx2 - 1);
      }
    } else if (!isExistingIdx(idx1) && isExistingIdx(idx2)) {
      // From is not in list of interval endpoints, to is
      const insertIdx1 = getInsertIdx(idx1);
      if (isStartIdx(insertIdx1)) {
        // From is not contained within existing intervals
        // insert [1..4] into [2...4] -> modify start
        this._intervals[insertIdx1] = range.from;
      }
      // else:
      // From is contained within existing intervals
      // insert [2..4] into [1...4] -> [1..4] (unchanged)
    } else if (isExistingIdx(idx1) && !isExistingIdx(idx2)) {
      // From is in list of interval endpoints, to is not
      const insertIdx2 = getInsertIdx(idx2);
      if (isStartIdx(insertIdx2)) {
        // To is not contained withing existing intervals
        // insert [1..5] into [2..4] -> modify end
        this._intervals[insertIdx2 - 1] = range.toInclusive;
      }
      // else:
      // To is contained within an existing interval
      // insert [1..3] into [1..4] -> [1..4] (unchanged)
    } else if (isExistingIdx(idx1) && (idx1 === idx2 || idx2 === idx1 + 1)) {
      // Nothing to do, range is already embedded in other range
    } else {
      throw new Error(`Not implemented (idx1: ${idx1}, idx2: ${idx2})`);
    }
  }

  remove(index: number) {
    // this._indices.delete(index);
  }

  removeRange(range: NumericRange) {
    // for (let index = range.from; index <= range.toInclusive; ++index) {
    //   this._indices.delete(index);
    // }
  }

  clear() {
    this._intervalsCount = 0;
  }

  get count(): number {
    let count = 0;
    for (let i = 0; i < this._intervalsCount; i += 2) {
      count += this._intervals[i + 1] - this._intervals[i] + 1;
    }
    return count;
  }

  contains(index: number): boolean {
    const intervalIdx = binarySearchLastIndexOf(this._intervals, index, this._intervalsCount);
    if (intervalIdx >= 0) {
      return true;
    }

    throw new Error('Not implemented');
  }

  *ranges(): Generator<NumericRange> {
    for (let i = 0; i < this._intervalsCount; i += 2) {
      yield NumericRange.createFromInterval(this._intervals[i], this._intervals[i + 1]);
    }
  }

  raw(): number[] {
    return this._intervals.slice(0, this._intervalsCount);
  }

  toPlainSet(): Set<number> {
    const set = new Set<number>();
    for (const range of this.ranges()) {
      range.forEach(x => set.add(x));
    }
    return set;
  }

  // unionWith(other: IndexSet): void {
  //   for (const index of other._indices) {
  //     this._indices.add(index);
  //   }
  // }
  // hasIntersectionWith(other: Set<number>): boolean;
  // hasIntersectionWith(other: IndexSet): boolean;
  // hasIntersectionWith(other: IndexSet | Set<number>): boolean {
  //   if (other instanceof IndexSet) {
  //     return hasIntersection(this._indices, other._indices);
  //   } else {
  //     return hasIntersection(this._indices, other);
  //   }
  // }

  // intersectWith(other: IndexSet): IndexSet {
  //   for (const index of this._indices) {
  //     if (!other.contains(index)) {
  //       this.remove(index);
  //     }
  //   }
  //   return this;
  // }

  // differenceWith(other: IndexSet): IndexSet {
  //   for (const index of other._indices) {
  //     if (this.contains(index)) {
  //       this.remove(index);
  //     }
  //   }
  //   return this;
  // }

  // toArray(): number[] {
  //   return Array.from(this._indices);
  // }

  // values(): Iterable<number> {
  //   return this._indices.values();
  // }

  private ensureCapacity(capacity: number) {
    if (capacity > this._intervals.length) {
      this._intervals.length = Math.max(capacity, Math.floor(this._intervals.length * 1.5));
    }
    // TODO 2021-02-13 larsmoa: Fix shrinking
  }

  private makeRoomAt(index: number) {
    this.ensureCapacity(this._intervalsCount + 2);
    if (index < this._intervalsCount) {
      shiftValuesRight(this._intervals, index, 2);
    }
  }

  private mergeIntervals(indexFrom: number, indexTo: number) {
    const reductionCount = indexTo - indexFrom;
    for (let i = 0; i < reductionCount; i++) {
      this._intervals[i + indexFrom] = this._intervals[i + indexTo];
    }
    this._intervalsCount -= reductionCount;
  }
}
function hasIntersection(left: Set<number>, right: Set<number>): boolean {
  // Can we improve performance by using a bloom filter before comparing full sets?
  const needles = left.size < right.size ? left : right;
  const haystack = left.size > right.size ? left : right;

  let intersects = false;
  const it = needles.values();
  let itCurr = it.next();
  while (!intersects && !itCurr.done) {
    intersects = haystack.has(itCurr.value);
    itCurr = it.next();
  }

  return intersects;
}
