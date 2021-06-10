/*!
 * Copyright 2021 Cognite AS../NumericRange
 */
import { IntermediateIndexNode } from './IntermediateIndexNode';
import { IndexNode } from './IndexSet';
import { NumericRange } from '../NumericRange';

export class LeafIndexNode {
  readonly range: NumericRange;
  readonly count: number;
  readonly maxSubtreeDepth: number;

  static fromInterval(begin: number, endInclusive: number) {
    return new LeafIndexNode(NumericRange.createFromInterval(begin, endInclusive));
  }

  constructor(range: NumericRange) {
    this.range = range;
    this.maxSubtreeDepth = 0;
    this.count = range.count;
  }

  traverse(visitor: (range: NumericRange) => void) {
    visitor(this.range);
  }

  contains(index: number): boolean {
    return this.range.contains(index);
  }

  addRange(range: NumericRange): IndexNode {
    if (this.range.intersectsOrCoinciding(range)) {
      // Create union range
      return new LeafIndexNode(this.range.union(range));
    }

    return IntermediateIndexNode.fromIndexNodesAndBalance(this, new LeafIndexNode(range));
  }

  removeRange(range: NumericRange): IndexNode | undefined {
    if (!range.intersects(this.range)) {
      return this;
    }

    if (this.range.isInside(range)) {
      return undefined;
    }

    let leftRange: NumericRange | undefined = undefined;
    let rightRange: NumericRange | undefined = undefined;

    if (this.range.from < range.from) {
      leftRange = NumericRange.createFromInterval(this.range.from, range.from - 1);
    }

    if (this.range.toInclusive > range.toInclusive) {
      rightRange = NumericRange.createFromInterval(range.toInclusive + 1, this.range.toInclusive);
    }

    if (leftRange != undefined && rightRange != undefined) {
      return IntermediateIndexNode.fromIndexNodesAndBalance(
        new LeafIndexNode(leftRange),
        new LeafIndexNode(rightRange)
      );
    } else if (leftRange != undefined) {
      return new LeafIndexNode(leftRange);
    } else if (rightRange != undefined) {
      return new LeafIndexNode(rightRange);
    } else {
      return undefined;
    }
  }

  hasIntersectionWith(node: IndexNode): boolean {
    return node.range.intersects(this.range);
  }

  soak(range: NumericRange): [IndexNode | undefined, NumericRange] {
    if (this.range.intersectsOrCoinciding(range)) {
      return [undefined, this.range.union(range)];
    } else {
      return [this, range];
    }
  }

  clone(): LeafIndexNode {
    return new LeafIndexNode(this.range);
  }
}
