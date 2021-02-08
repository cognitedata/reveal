/*!
 * Copyright 2021 Cognite AS
 */

import { NumericRange } from './NumericRange';

export class IndexSet {
  private readonly _indices: Set<number>;

  constructor(values?: Iterable<number>) {
    this._indices = new Set<number>(values);
  }

  clone(): IndexSet {
    return new IndexSet(this._indices);
  }

  add(index: number) {
    this._indices.add(index);
  }

  addRange(range: NumericRange) {
    for (let index = range.from; index <= range.toInclusive; ++index) {
      this._indices.add(index);
    }
  }

  remove(index: number) {
    this._indices.delete(index);
  }

  removeRange(range: NumericRange) {
    for (let index = range.from; index <= range.toInclusive; ++index) {
      this._indices.delete(index);
    }
  }

  clear() {
    this._indices.clear();
  }

  get count(): number {
    return this._indices.size;
  }

  contains(index: number): boolean {
    return this._indices.has(index);
  }

  unionWith(other: IndexSet): void {
    for (const index of other._indices) {
      this._indices.add(index);
    }
  }
  hasIntersectionWith(other: Set<number>): boolean;
  hasIntersectionWith(other: IndexSet): boolean;
  hasIntersectionWith(other: IndexSet | Set<number>): boolean {
    if (other instanceof IndexSet) {
      return hasIntersection(this._indices, other._indices);
    } else {
      return hasIntersection(this._indices, other);
    }
  }

  intersectWith(other: IndexSet): IndexSet {
    for (const index of this._indices) {
      if (!other.contains(index)) {
        this.remove(index);
      }
    }
    return this;
  }

  differenceWith(other: IndexSet): IndexSet {
    for (const index of other._indices) {
      if (this.contains(index)) {
        this.remove(index);
      }
    }
    return this;
  }

  toArray(): number[] {
    return Array.from(this._indices);
  }

  values(): Iterable<number> {
    return this._indices.values();
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
