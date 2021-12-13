/*!
 * Copyright 2021 Cognite AS
 */

export class NumericRange {
  readonly from: number;
  readonly count: number;
  readonly toInclusive: number;

  constructor(from: number, count: number) {
    if (count < 0) {
      throw new Error('Range cannot have negative number of elements');
    }

    this.from = from;
    this.count = count;
    this.toInclusive = from + count - 1;
  }

  static createFromInterval(from: number, toInclusive: number): NumericRange {
    return new NumericRange(from, toInclusive - from + 1);
  }

  *values(): Generator<number> {
    for (let i = this.from; i <= this.toInclusive; ++i) {
      yield i;
    }
  }

  toArray(): number[] {
    return Array.from(this.values());
  }

  equal(other: NumericRange): boolean {
    return this.from === other.from && this.count === other.count;
  }

  contains(value: number): boolean {
    return value >= this.from && value <= this.toInclusive;
  }

  intersects(range: NumericRange): boolean {
    return this.from <= range.toInclusive && this.toInclusive >= range.from;
  }

  intersectsOrCoinciding(range: NumericRange): boolean {
    return this.from <= range.toInclusive + 1 && this.toInclusive + 1 >= range.from;
  }

  intersectionWith(range: NumericRange): NumericRange | undefined {
    if (!this.intersects(range)) {
      return undefined;
    } else {
      return NumericRange.createFromInterval(
        Math.max(this.from, range.from),
        Math.min(this.toInclusive, range.toInclusive)
      );
    }
  }

  isInside(range: NumericRange): boolean {
    return this.from >= range.from && this.toInclusive <= range.toInclusive;
  }

  union(range: NumericRange): NumericRange {
    return NumericRange.createFromInterval(
      Math.min(this.from, range.from),
      Math.max(this.toInclusive, range.toInclusive)
    );
  }

  forEach(action: (value: number) => void): void {
    for (let i = this.from; i <= this.toInclusive; ++i) {
      action(i);
    }
  }

  toString(): string {
    return '(' + this.from + ', ' + this.toInclusive + ')';
  }

  static isNumericRange(value: any): value is NumericRange {
    if (!value) return false;

    const range = value as NumericRange;
    return range.from !== undefined && range.count !== undefined && range.toInclusive !== undefined;
  }
}
