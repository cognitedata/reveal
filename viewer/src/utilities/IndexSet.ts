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
      return idx < 0 ? -idx - 1 : idx;
    }
    function isExistingIdx(idx: number): boolean {
      return idx >= 0;
    }
    function isStartIdx(idx: number): boolean {
      return idx % 2 == 0;
    }

    const idx1 = binarySearchLastIndexOf(this._intervals, range.from, this._intervalsCount);
    const idx2 = binarySearchLastIndexOf(this._intervals, range.toInclusive, this._intervalsCount);
    const insertIdx1 = getInsertIdx(idx1);
    const insertIdx2 = getInsertIdx(idx2);

    if (!isExistingIdx(idx1) && isStartIdx(insertIdx1) && idx1 === idx2) {
      // New range
      this.makeRoomAt(insertIdx1);

      this._intervals[insertIdx1] = range.from;
      this._intervals[insertIdx1 + 1] = range.toInclusive;
      this._intervalsCount += 2;
    } else {
      let firstToRemove = insertIdx1;
      let lastToRemove = insertIdx2;

      // Handle start
      if (!isExistingIdx(idx1) && isStartIdx(insertIdx1)) {
        this._intervals[insertIdx1] = range.from;
        firstToRemove++;
      }

      // Hande end
      if (!isExistingIdx(idx2) && isStartIdx(insertIdx2)) {
        this._intervals[insertIdx2 - 1] = range.toInclusive;
        lastToRemove--;
      }

      // Repair/merge
      if (lastToRemove > firstToRemove + 1) {
        this.mergeIntervals(firstToRemove, lastToRemove);
      }
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
    this._intervals.splice(indexFrom, reductionCount);
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
