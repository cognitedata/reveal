/*!
 * Copyright 2022 Cognite AS
 */
import { Box3, Vector3 } from 'three';

/**
 * IoU - Intersection over Union, measure of overlap between two boxes.
 *
 * 0 means no overlap
 * 1 means the two boxes are identical
 */
export function intersectionOverUnion(box1: Box3, box2: Box3): number {
  const intersection = box1.clone().intersect(box2);
  const union = box1.clone().union(box2);

  const intsize = intersection.getSize(new Vector3());
  const unsize = union.getSize(new Vector3());

  return (intsize.x * intsize.y * intsize.z) / (unsize.x * unsize.y * unsize.z);
}

function wouldExtendBy(originalBox: Box3, newBox: Box3): number {
  const newMinExtent = new Vector3().subVectors(newBox.min, originalBox.min).min(new Vector3());
  const newMaxExtent = new Vector3().subVectors(originalBox.max, newBox.max).min(new Vector3());

  const fullExtentExpansion = new Vector3().addVectors(newMinExtent, newMaxExtent);
  return fullExtentExpansion.length();
}

const MERGE_VOLUME_LIMIT = 1.2;

function canMergeOnSameNode(box1: Box3, box2: Box3): boolean {
  const unionBox = box1.clone().union(box2);
  const unionSize = unionBox.getSize(new Vector3());
  const unionVolume = unionSize.x * unionSize.y * unionSize.z;

  const size1 = box1.getSize(new Vector3());
  const size2 = box2.getSize(new Vector3());

  return (
    unionVolume <= size1.x * size1.y * size1.z * MERGE_VOLUME_LIMIT ||
    unionVolume <= size2.x * size2.y * size2.z * MERGE_VOLUME_LIMIT
  );
}

/*
 * RTree implementation containing boxes, merges boxes lying close to each other
 */
export class MergingRTree {
  private root: RTreeNode | undefined = undefined;

  insert(box: Box3): void {
    this.root = this.root?.insert(box) ?? new RTreeNode(box);
  }

  *getBoxes(): Generator<Box3> {
    if (this.root) {
      yield* this.root.getBoxes();
    }
  }

  getSize(): number {
    return this.root?.numBoxes ?? 0;
  }

  clone(): MergingRTree {
    const newTree = new MergingRTree();
    newTree.root = this.root?.clone();

    return newTree;
  }

  findOverlappingBoxes(box: Box3): Box3[] {
    const results: Box3[] = [];
    this.root?.findOverlappingBoxes(box, results);
    return results;
  }

  /**
   * union - Returns the union of two MergingRTree. Does not mutate this object nor the input object
   */
  union(inTree: MergingRTree): MergingRTree {
    const [unionTree, otherTree] = this.getSize() < inTree.getSize() ? [inTree.clone(), this] : [this.clone(), inTree];

    const insertBoxes = otherTree.getBoxes();
    for (const insertBox of insertBoxes) {
      unionTree.insert(insertBox);
    }

    return unionTree;
  }

  private addIntersectionsFromTree(constructingTree: MergingRTree, box: Box3, tree: MergingRTree) {
    const overlappingBoxes = tree.findOverlappingBoxes(box);
    for (const overlappingBox of overlappingBoxes) {
      const intersection = box.clone().intersect(overlappingBox);
      if (!intersection.isEmpty()) {
        constructingTree.insert(intersection);
      }
    }
  }

  private addAllIntersections(
    constructingTree: MergingRTree,
    biggestTree: MergingRTree,
    smallestTree: MergingRTree
  ): void {
    const boxesOfSmallestTree = smallestTree.getBoxes();

    for (const box of boxesOfSmallestTree) {
      this.addIntersectionsFromTree(constructingTree, box, biggestTree);
    }
  }

  intersection(inTree: MergingRTree): MergingRTree {
    const [biggestTree, smallestTree] = this.getSize() < inTree.getSize() ? [inTree, this] : [this, inTree];

    const rtree = new MergingRTree();

    this.addAllIntersections(rtree, biggestTree, smallestTree);

    return rtree;
  }
}

class RTreeNode {
  readonly bounds: Box3;
  readonly children: [RTreeNode, RTreeNode] | null;
  readonly numBoxes: number;

  constructor(child0: RTreeNode, child1: RTreeNode);
  constructor(box: Box3);
  constructor(a1: Box3 | RTreeNode, a2?: RTreeNode) {
    if (a1 instanceof Box3 && !a2) {
      this.children = null;
      this.bounds = a1.clone();
      this.numBoxes = 1;
    } else if (a1 instanceof RTreeNode && a2 instanceof RTreeNode) {
      this.children = [a1, a2];
      this.bounds = a1.bounds.clone().union(a2.bounds);
      this.numBoxes = a1.numBoxes + a2.numBoxes;
    } else {
      throw new Error('Invalid argument combination to RTreeNode constructor');
    }
  }

  private insertBoxAtLeafNode(box: Box3): RTreeNode {
    if (canMergeOnSameNode(this.bounds, box)) {
      return new RTreeNode(this.bounds.clone().union(box));
    } else {
      return new RTreeNode(new RTreeNode(this.bounds), new RTreeNode(box));
    }
  }

  private insertBoxInBestSubtree(box: Box3): RTreeNode {
    if (this.children === null) {
      throw Error('Null children at insertBoxInBestSubtree');
    }

    const BOX_MERGE_MIN_IOU = 0.3;

    const expand1 = wouldExtendBy(this.children[0].bounds, box);
    const expand2 = wouldExtendBy(this.children[1].bounds, box);

    const [newNode, preservedChild] =
      expand1 < expand2
        ? [this.children[0].insert(box), this.children[1]]
        : [this.children[1].insert(box), this.children[0]];

    if (intersectionOverUnion(newNode.bounds, preservedChild.bounds) > BOX_MERGE_MIN_IOU) {
      // TODO: Find a more optimal way of returning this (e.g. insert at root of tree)
      return new RTreeNode(newNode.bounds.clone().union(preservedChild.bounds));
    } else {
      return new RTreeNode(newNode, preservedChild);
    }
  }

  insert(box: Box3): RTreeNode {
    if (this.children === null) {
      return this.insertBoxAtLeafNode(box);
    } else {
      return this.insertBoxInBestSubtree(box);
    }
  }

  *getBoxes(): Generator<Box3> {
    if (this.children !== null) {
      yield* this.children[0].getBoxes();
      yield* this.children[1].getBoxes();
    } else {
      yield this.bounds;
    }
  }

  clone(): RTreeNode {
    if (this.children !== null) {
      return new RTreeNode(this.children[0].clone(), this.children[1].clone());
    } else {
      return new RTreeNode(this.bounds.clone());
    }
  }

  private getOverlappingBoxesIfIntersecting(box: Box3, node: RTreeNode, results: Box3[]): void {
    if (node.bounds.intersectsBox(box)) {
      node.findOverlappingBoxes(box, results);
    }
  }

  findOverlappingBoxes(box: Box3, results: Box3[]): void {
    if (this.children !== null) {
      this.getOverlappingBoxesIfIntersecting(box, this.children[0], results);
      this.getOverlappingBoxesIfIntersecting(box, this.children[1], results);
    } else {
      if (this.bounds.intersectsBox(box)) {
        results.push(this.bounds.clone());
      }
    }
  }
}
