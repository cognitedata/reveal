/*!
 * Copyright 2020 Cognite AS
 */

import { callActionWithIndicesAsync } from '@/utilities/callActionWithIndicesAsync';

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

  *values(): Generator<number> {
    for (let i = this.from; i <= this.toInclusive; ++i) {
      yield i;
    }
  }

  toArray(): number[] {
    return Array.from(this.values());
  }

  contains(value: number): boolean {
    return value >= this.from && value <= this.toInclusive;
  }

  forEach(action: (value: number) => void): void {
    for (let i = this.from; i <= this.toInclusive; ++i) {
      action(i);
    }
  }
}
