/*
 * Copyright 2021 Cognite AS
 */
import { IntermediateIndexNode } from './IntermediateIndexNode';
import { LeafIndexNode } from './LeafIndexNode';
import { NumericRange } from '../NumericRange';

export type IndexNode = IntermediateIndexNode | LeafIndexNode;

export class IndexSet {
  rootNode?: IndexNode;

  constructor(values?: Iterable<number>);
  constructor(values?: NumericRange);
  constructor(values?: Iterable<number> | NumericRange) {
    if (values == undefined) {
      this.rootNode = undefined;
    } else if (values instanceof NumericRange) {
      this.addRange(values);
    } else {
      for (const index of values) {
        this.add(index);
      }
    }
  }

  add(index: number) {
    const range = new NumericRange(index, 1);

    this.addRange(range);
  }

  addRange(range: NumericRange) {
    if (this.rootNode) {
      this.rootNode = this.rootNode.addRange(range);
    } else {
      this.rootNode = new LeafIndexNode(range);
    }
  }

  remove(index: number) {
    const range = new NumericRange(index, 1);
    this.removeRange(range);
  }

  removeRange(range: NumericRange) {
    if (this.rootNode) {
      this.rootNode = this.rootNode.removeRange(range);
    }

    // Do nothing if root is empty
  }

  contains(index: number): boolean {
    if (this.rootNode) {
      return this.rootNode.contains(index);
    }

    return false;
  }

  get count(): number {
    if (this.rootNode) {
      return this.rootNode.count;
    }

    return 0;
  }

  ranges(): NumericRange[] {
    if (this.rootNode) {
      return this.rootNode.ranges();
    }
    return [];
  }

  toArray(): number[] {
    const result: number[] = [];

    if (this.rootNode) {
      const rs: NumericRange[] = this.ranges();

      rs.forEach(range => {
        range.forEach(num => {
          result.push(num);
        });
      });
    }

    return result;
  }

  values(): Iterable<number> {
    return this.toArray()[Symbol.iterator]();
  }

  toPlainSet(): Set<number> {
    const arr: number[] = this.toArray();

    const st = new Set(arr);

    return st;
  }

  // NB: Assumes that this.ranges() are in order from left to right
  invertedRanges(): NumericRange[] {
    const originalRanges = this.ranges();

    const newRanges: NumericRange[] = [];

    for (let i = 0; i < originalRanges.length - 1; i++) {
      if (originalRanges[i].toInclusive + 1 >= originalRanges[i + 1].from) {
        // Should not happen, but let's be safe
        continue;
      }
      newRanges.push(NumericRange.createFromInterval(originalRanges[i].toInclusive + 1, originalRanges[i + 1].from));
    }

    return newRanges;
  }

  unionWith(otherSet: IndexSet): IndexSet {
    if (this.rootNode) {
      const rs = otherSet.ranges();
      rs.forEach(range => {
        this.rootNode = (this.rootNode as IndexNode).addRange(range);
      });
    } else {
      this.rootNode = otherSet.rootNode;
    }

    return this;
  }

  differenceWith(otherSet: IndexSet): IndexSet {
    if (this.rootNode) {
      const rs = otherSet.ranges();
      rs.forEach(range => {
        if (this.rootNode) {
          this.rootNode = (this.rootNode as IndexNode).removeRange(range);
        }
      });
    }

    return this;
  }

  hasIntersectionWith(otherSet: IndexSet | Set<number>): boolean {
    if (otherSet instanceof IndexSet) {
      if (this.rootNode == undefined || otherSet.rootNode == undefined) {
        return false;
      }

      return this.rootNode.hasIntersectionWith(otherSet.rootNode);
    } else {
      for (const index of otherSet) {
        if (this.contains(index)) {
          return true;
        }
      }

      return false;
    }
  }

  intersectWith(otherSet: IndexSet): IndexSet {
    if (this.rootNode && otherSet.rootNode) {
      // Tackle endpoints
      // Remove left bounds outside input node set
      if (this.rootNode.range.from < otherSet.rootNode.range.from) {
        const leftBoundRange = NumericRange.createFromInterval(
          this.rootNode.range.from,
          otherSet.rootNode.range.from - 1
        );
        this.rootNode = this.rootNode.removeRange(leftBoundRange);

        if (!this.rootNode) {
          return this;
        }
      }

      // Remove right bounds outside input node set
      if (this.rootNode.range.toInclusive > otherSet.rootNode.range.toInclusive) {
        const rightBoundRange = NumericRange.createFromInterval(
          otherSet.rootNode.range.toInclusive + 1,
          this.rootNode.range.toInclusive
        );
        this.rootNode = this.rootNode.removeRange(rightBoundRange);
      }

      // Invert otherSet ranges and remove them
      const invRanges = otherSet.invertedRanges();

      invRanges.forEach(range => {
        if (this.rootNode) {
          this.rootNode = this.rootNode.removeRange(range);
        }
      });
    } else if (this.rootNode) {
      // Otherset is empty, set this to empty as well
      this.rootNode = undefined;
    }
    return this;
  }

  clear(): void {
    this.rootNode = undefined;
  }

  clone(): IndexSet {
    const st: IndexSet = new IndexSet();

    if (this.rootNode) {
      st.rootNode = this.rootNode.clone();
    }

    return st;
  }
}
