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

  intersectWith(other: IndexSet): void {
    for (const index of this._indices) {
      if (!other.contains(index)) {
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
