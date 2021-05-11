/*
 * Copyright 2021 Cognite AS
 */
import assert from 'assert';

import { NumericRange } from './NumericRange';

type IndexNode = IntermediateIndexNode | LeafIndexNode;

class IntermediateIndexNode {
  readonly range: NumericRange;
  readonly maxSubtreeDepth: number;
  readonly left: IndexNode;
  readonly right: IndexNode;
  readonly count: number;

  constructor(left: IndexNode, right: IndexNode) {
    this.left = left;
    this.right = right;

    this.maxSubtreeDepth = Math.max(this.left.maxSubtreeDepth, this.right.maxSubtreeDepth) + 1;
    this.range = NumericRange.createFromInterval(this.left.range.from, this.right.range.toInclusive);
    this.count = this.left.count + this.right.count;
  }

  static fromIndexNodesAndBalance(r0: IndexNode, r1: IndexNode) {
    if (r0.range.from > r1.range.toInclusive + 1) {
      return new IntermediateIndexNode(r1, r0).balance();
    } else if (r0.range.toInclusive + 1 < r1.range.from) {
      return new IntermediateIndexNode(r0, r1).balance();
    } else {
      // Help, overlapping nodes! There is an error somewhere!
      assert(false, 'Internal error in IndexSet: Overlapping nodes');
    }
  }

  contains(index: number): boolean {
    if (!this.range.contains(index)) {
      return false;
    }

    return this.left.contains(index) || this.right.contains(index);
  }

  addRange(range: NumericRange): IndexNode {
    const canUnionThis = range.intersectsOrCoinciding(this.range);

    if (!canUnionThis) {
      // The range is either entirely above or below the range of this node

      if (range.from < this.range.from) {
        const newNode = this.left.addRange(range);
        return IntermediateIndexNode.fromIndexNodesAndBalance(newNode, this.right);
      } else {
        const newNode = this.right.addRange(range);
        return IntermediateIndexNode.fromIndexNodesAndBalance(this.left, newNode);
      }
    }

    const canUnionLeft = range.intersectsOrCoinciding(this.left.range);
    const canUnionRight = range.intersectsOrCoinciding(this.right.range);

    if (canUnionLeft && canUnionRight) {
      // Range intersects both subtrees...

      const [newLeft, leftRange] = this.left.soak(range);
      const [newRight, rightRange] = this.right.soak(range);

      const unioned = leftRange.union(rightRange);

      if (newLeft == undefined && newRight == undefined) {
        return new LeafIndexNode(unioned);
      } else if (newLeft == undefined && newRight != undefined) {
        // Last term is added to please compiler
        return newRight.addRange(unioned);
      } else if (newRight == undefined && newLeft != undefined) {
        // ---"---
        return newLeft.addRange(unioned);
      }

      // "as" terms to avoid compiler complaints
      const newNode = IntermediateIndexNode.fromIndexNodesAndBalance(newLeft as IndexNode, newRight as IndexNode);

      return newNode.addRange(unioned);
    } else if (canUnionLeft) {
      return IntermediateIndexNode.fromIndexNodesAndBalance(this.left.addRange(range), this.right);
    } else if (canUnionRight) {
      return IntermediateIndexNode.fromIndexNodesAndBalance(this.left, this.right.addRange(range));
    } else {
      // Range lies between ranges of left and right subtree,
      // add to smallest
      if (this.left.maxSubtreeDepth < this.right.maxSubtreeDepth) {
        return IntermediateIndexNode.fromIndexNodesAndBalance(this.left.addRange(range), this.right);
      } else {
        return IntermediateIndexNode.fromIndexNodesAndBalance(this.left, this.right.addRange(range));
      }
    }
  }

  removeRange(range: NumericRange): IndexNode | undefined {
    // If input range does not intersect with this range, return
    if (!range.intersects(this.range)) {
      return this;
    }

    const [newThis, soakedRange] = this.soak(range);

    let leftRange: NumericRange | undefined = undefined;
    let rightRange: NumericRange | undefined = undefined;

    // If soakedRange extends to either the left or right to the
    // numeric range, we take the ranges extending out and insert anew.
    if (soakedRange.from < range.from) {
      leftRange = NumericRange.createFromInterval(soakedRange.from, range.from - 1);
    }

    if (soakedRange.toInclusive > range.toInclusive) {
      rightRange = NumericRange.createFromInterval(range.toInclusive + 1, soakedRange.toInclusive);
    }

    if (newThis == undefined) {
      // If all ranges in this was soaked up, create new node with
      // non-empty left and right ranges
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
    } else {
      // Add non-empty left- and right ranges

      let nodeToReturn = newThis;

      if (leftRange != undefined) {
        nodeToReturn = nodeToReturn.addRange(leftRange);
      }

      if (rightRange != undefined) {
        nodeToReturn = nodeToReturn.addRange(rightRange);
      }

      return nodeToReturn;
    }
  }

  balance(): IntermediateIndexNode {
    const d0 = this.left.maxSubtreeDepth;
    const d1 = this.right.maxSubtreeDepth;

    if (d1 + 2 <= d0) {
      // Left side too deep
      const newLeft = (this.left as IntermediateIndexNode).rotateSmallerRight();
      const newNode = new IntermediateIndexNode(newLeft, this.right).rotateRight().balance();

      return newNode;
    } else if (d0 + 2 <= d1) {
      // Right side too deep

      const newRight = (this.right as IntermediateIndexNode).rotateSmallerLeft();
      const newNode = new IntermediateIndexNode(this.left, newRight).rotateLeft().balance();

      return newNode;
    }

    return this;
  }

  ranges(): NumericRange[] {
    return this.left.ranges().concat(this.right.ranges());
  }

  clone(): IntermediateIndexNode {
    return IntermediateIndexNode.fromIndexNodesAndBalance(this.left.clone(), this.right.clone());
  }

  hasIntersectionWith(node: IndexNode): boolean {
    if (!node.range.intersects(this.range)) {
      return false;
    }

    // Make sure containing range is the "this"
    if (this.range.isInside(node.range)) {
      return node.hasIntersectionWith(this);
    }

    // Here, we know this range is not contained within node range

    if (this.left.range.intersects(node.range)) {
      if (this.left.hasIntersectionWith(node)) {
        return true;
      }
    }

    if (this.right.range.intersects(node.range)) {
      if (this.right.hasIntersectionWith(node)) {
        return true;
      }
    }

    return false;
  }

  /*
   * Utilities
   */

  // Soak up/ delete numeric range touching the input range,
  // returning union of soaked ranges and input range

  // This operation is used as a substep when adding a range - the range
  // is first used to "soak" up all touching ranges in the tree, since these must be part of a
  // common union range at the end of the insertion. In the end, the range, unioned with
  // all its soaked ranges in the tree, is inserted normally.
  soak(range: NumericRange): [IndexNode | undefined, NumericRange] {
    let [leftRes, leftRange]: [IndexNode | undefined, NumericRange] = [this.left, range];
    let [rightRes, rightRange]: [IndexNode | undefined, NumericRange] = [this.right, range];

    // Both subtrees are inside range, soak up everything
    if (this.right.range.isInside(range) && this.left.range.isInside(range)) {
      return [undefined, range];
    }

    // Compute what's left on the left, and the soaked-up range
    if (this.left.range.intersectsOrCoinciding(range)) {
      [leftRes, leftRange] = this.left.soak(range);
    }

    // Compute what's left on the right, and the soaked-up range
    if (this.right.range.intersectsOrCoinciding(range)) {
      [rightRes, rightRange] = this.right.soak(range);
    }

    // The two soaked-up ranges must touch (they both contain the argument range)
    const unionRange = leftRange.union(rightRange);

    if (rightRes == undefined) {
      return [leftRes, unionRange];
    } else if (leftRes == undefined) {
      return [rightRes, unionRange];
    } else {
      const newNode = IntermediateIndexNode.fromIndexNodesAndBalance(leftRes, rightRes);
      return [newNode, unionRange];
    }
  }

  /*
   * Rotations
   */

  rotateRight(): IntermediateIndexNode {
    if (!('right' in this.left)) {
      // Left node is leaf node. Abort rotation
      return this;
    }

    return new IntermediateIndexNode(
      (this.left as IntermediateIndexNode).left,
      new IntermediateIndexNode((this.left as IntermediateIndexNode).right, this.right)
    );
  }

  rotateLeft(): IntermediateIndexNode {
    if (!('left' in this.right)) {
      // Left node is leaf node. Abort rotation
      return this;
    }

    return new IntermediateIndexNode(
      new IntermediateIndexNode(this.left, (this.right as IntermediateIndexNode).left),
      (this.right as IntermediateIndexNode).right
    );
  }

  // Rotate so that smaller subtree is on left
  rotateSmallerLeft(): IntermediateIndexNode {
    if (this.left.maxSubtreeDepth > this.right.maxSubtreeDepth) {
      // If left subtree depth is larger, it must be of type IntermediateIndexNode
      let nextRoot = this.rotateRight() as IntermediateIndexNode;
      nextRoot = nextRoot.rotateSmallerLeft();
      return nextRoot;
    }

    return this;
  }

  // Rotate so that smaller subtree is on right
  rotateSmallerRight(): IntermediateIndexNode {
    if (this.right.maxSubtreeDepth > this.left.maxSubtreeDepth) {
      // If left subtree depth is larger, it must be of type IntermediateIndexNode
      let nextRoot = this.rotateLeft() as IntermediateIndexNode;
      nextRoot = nextRoot.rotateSmallerRight();
      return nextRoot;
    }

    return this;
  }

  /*
   * Debug
   */

  print() {
    // console.log("node - leftDepth = " + this.left.maxSubtreeDepth + ", rightDepth = " + this.right.maxSubtreeDepth);
    this.left.print();
    this.right.print();
  }
}

class LeafIndexNode {
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
    if (node.range.intersects(this.range)) {
      return true;
    } else {
      return false;
    }
  }

  soak(range: NumericRange): [IndexNode | undefined, NumericRange] {
    if (this.range.intersectsOrCoinciding(range)) {
      return [undefined, this.range.union(range)];
    } else {
      return [this, range];
    }
  }

  ranges(): NumericRange[] {
    return [this.range];
  }

  clone(): LeafIndexNode {
    return new LeafIndexNode(this.range);
  }

  print() {
    // console.log(`leaf(${this.range.from}, ${this.range.toInclusive})`);
  }
}

export class IndexSet {
  rootNode?: IndexNode;

  constructor(values?: Iterable<number>) {
    if (values == undefined) {
      this.rootNode = undefined;
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

  print() {
    // console.log("Print all");
    if (this.rootNode) {
      this.rootNode.print();
    } else {
      // console.log("empty");
    }
  }
}
