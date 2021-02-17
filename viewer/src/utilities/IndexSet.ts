/*!
 * Copyright 2021 Cognite AS
 */

import { binarySearchLastIndexOf, shiftValuesRight } from './arrays';
import { NumericRange } from './NumericRange';

export class IndexSet {
  // Sorted pairs of [from,to]-elements of the contained ranges. The elements
  // are sorted and strictly non-decreasing (there can be equal elements
  // for single-element intervals)
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
    function getInsertIdx(idx: number): number {
      return idx < 0 ? -idx - 1 : idx;
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
      } else if (isExistingIdx(idx1) && isStartIdx(insertIdx1)) {
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

  removeRange(range: NumericRange): void {
    function getRemoveIdx(idx: number): number {
      return idx < 0 ? -idx - 1 : idx;
    }

    const newEndpoints = NumericRange.createFromInterval(range.from - 1, range.toInclusive + 1);
    const idx1 = binarySearchLastIndexOf(this._intervals, newEndpoints.from, this._intervalsCount);
    let removeIdx1 = getRemoveIdx(idx1);

    // Handle start
    switch (true) {
      case !isExistingIdx(idx1) && isEndIdx(removeIdx1):
        this.makeRoomAt(removeIdx1);
        this._intervals[removeIdx1] = newEndpoints.from;
        this._intervals[removeIdx1 + 1] = newEndpoints.from + 1;
        this._intervalsCount += 2;
        removeIdx1++;
        break;

      case !isExistingIdx(idx1) && isStartIdx(removeIdx1):
        break;

      case isExistingIdx(idx1) && isStartIdx(removeIdx1):
        break;

      case isExistingIdx(idx1) && isEndIdx(removeIdx1):
        removeIdx1++;
        break;

      default:
        throw new Error('Not supported');
    }

    const idx2 = binarySearchLastIndexOf(this._intervals, newEndpoints.toInclusive, this._intervalsCount);
    let removeIdx2 = getRemoveIdx(idx2);
    // Handle end
    switch (true) {
      case !isExistingIdx(idx2) && isEndIdx(removeIdx2):
        this._intervals[removeIdx2 - 1] = newEndpoints.toInclusive;
        removeIdx2--;
        break;

      case !isExistingIdx(idx2) && isStartIdx(removeIdx2):
        break;

      case isExistingIdx(idx2) && isStartIdx(removeIdx2):
        break;

      case isExistingIdx(idx2) && isEndIdx(removeIdx2):
        break;

      default:
        throw new Error('Not supported');
    }

    // Repair
    if (removeIdx1 < removeIdx2) {
      this.mergeIntervals(removeIdx1, removeIdx2);
    }

    // if (!isExistingIdx(idx1) && isEndIdx(removeIdx1)) {
    //   // [1..6] - [3..4] -> [1..2],[5..6]
    //   this._intervals[removeIdx1] = range.from - 1;
    // } else {
    // }

    // // [1..6] - [3..4] ->
    // // Handle end
    // if (!isExistingIdx(idx2) && isEndIdx(removeIdx2)) {
    //   this._intervals[]
    // }
  }

  remove(index: number) {
    // this._indices.delete(index);
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

  contains(value: number): boolean {
    const intervalIdx = binarySearchLastIndexOf(this._intervals, value, this._intervalsCount);
    return isExistingIdx(intervalIdx) || !isStartIdx(intervalIdx);
  }

  *ranges(): Generator<NumericRange> {
    for (let i = 0; i < this._intervalsCount; i += 2) {
      yield NumericRange.createFromInterval(this._intervals[i], this._intervals[i + 1]);
    }
  }

  toPlainSet(): Set<number> {
    const set = new Set<number>();
    for (const range of this.ranges()) {
      range.forEach(x => set.add(x));
    }
    return set;
  }

  unionWith(other: IndexSet): void {
    for (const range of other.ranges()) {
      this.addRange(range);
    }
  }
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

function isExistingIdx(idx: number): boolean {
  return idx >= 0;
}

function isStartIdx(idx: number): boolean {
  return idx % 2 == 0;
}

function isEndIdx(idx: number): boolean {
  return !isStartIdx(idx);
}
