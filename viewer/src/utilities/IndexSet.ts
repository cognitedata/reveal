/*!
 * Copyright 2021 Cognite AS
 */

export class IndexSet {
  private readonly _indices: Set<number>;

  constructor(values?: Iterable<number>) {
    this._indices = new Set<number>(values);
  }

  clone(): IndexSet {
    return new IndexSet(this._indices);
  }

  add(index: number, rangeCount: number = 1) {
    for (let i = 0; i < rangeCount; ++i) {
      this._indices.add(index + i);
    }
  }

  remove(index: number, rangeCount: number = 1) {
    for (let i = 0; i < rangeCount; ++i) {
      this._indices.delete(index + i);
    }
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

  intersectWith(other: IndexSet): void {
    for (const index of this._indices) {
      if (!other.contains(index)) {
        this.remove(index);
      }
    }
  }

  differenceWith(other: IndexSet): void {
    for (const index of other._indices) {
      if (this.contains(index)) {
        this.remove(index);
      }
    }
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
